const mongoose = require('mongoose');
const { Class } = require('../models/classes'); // Import your Class model
const Attendance = require('../models/Attendance');
const Teacher = require('../models/teacherdata'); // adjust path if needed
const Student = require("../models/studentdata"); // Adjust path as needed


exports.markAttendance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { classId, sectionId, sectionName, date, markedBy, attendance } = req.body;

        // 1. Validate input
        const missingFields = [];
        if (!classId) missingFields.push('classId');
        if (!date) missingFields.push('date');
        if (!markedBy) missingFields.push('markedBy');
        if (!attendance) missingFields.push('attendance');
        if (!sectionId && !sectionName) missingFields.push('sectionId or sectionName');
        
        if (missingFields.length > 0) {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // 2. Find the teacher who is marking attendance
        const teacher = await Teacher.findOne({ email: markedBy }).session(session);
        if (!teacher) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // 3. Find the class and section
        const query = { _id: classId };
        if (sectionId) {
            query['sections._id'] = sectionId;
        } else {
            query['sections.name'] = sectionName;
        }

        const classObj = await Class.findOne(query).session(session);
        if (!classObj) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Class or section not found'
            });
        }

        const section = sectionId 
            ? classObj.sections.find(s => s._id.equals(sectionId))
            : classObj.sections.find(s => s.name === sectionName);

        if (!section) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            });
        }

        // 4. Verify all students belong to this section
        const studentIds = attendance.map(a => new mongoose.Types.ObjectId(a.studentId));
        const invalidStudents = studentIds.filter(id => 
            !section.students.some(sId => sId.equals(id))
        );

        if (invalidStudents.length > 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Some students not found in this section',
                invalidStudents: invalidStudents.map(id => id.toString())
            });
        }

        // 5. Group attendance by period
        const periodMap = new Map();
        
        attendance.forEach(student => {
            student.status.forEach(periodStatus => {
                if (!periodMap.has(periodStatus.period)) {
                    periodMap.set(periodStatus.period, []);
                }
                periodMap.get(periodStatus.period).push({
                    studentId: student.studentId,
                    status: periodStatus.status
                });
            });
        });

        // 6. Prepare attendance record
        const attendanceRecord = {
            classId: classObj._id,
            sectionId: section._id,
            date: new Date(date),
            markedBy: teacher._id,
            periods: Array.from(periodMap).map(([period, students]) => ({
                period,
                students
            }))
        };

        // 7. Insert record (with upsert to prevent duplicates)
        const result = await Attendance.findOneAndUpdate(
            {
                classId: classObj._id,
                sectionId: section._id,
                date: new Date(date)
            },
            attendanceRecord,
            { 
                upsert: true, 
                new: true,
                session 
            }
        );

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: `Attendance recorded successfully`,
            data: {
                class: classObj.name,
                section: section.name,
                date,
                periodCount: periodMap.size,
                studentCount: attendance.length
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Attendance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to record attendance',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};

// Enhanced getAttendanceByDate with population and filtering
exports.getAttendanceByDate = async (req, res) => {
    try {
        const { classId, sectionId, date } = req.body;

        // Validate required parameters
        if (!classId || !sectionId || !date) {
            return res.status(400).json({
                success: false,
                message: "Required parameters: classId, sectionId, date"
            });
        }

        // Find attendance by class, section, and date
        const attendance = await Attendance.findOne({
            classId: new mongoose.Types.ObjectId(classId),
            sectionId: new mongoose.Types.ObjectId(sectionId),
            date: new Date(date)
        })
        .populate({
            path: 'periods.students.studentId',  // Populate inside periods -> students -> studentId
            model: 'User',  // Use the correct model name for students
            select: 'Student_name Roll_No'  // Adjust field names based on your schema
        });

        // If no attendance record is found
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "No attendance record found for this date."
            });
        }

        // Reorganize data student-wise
        const studentMap = {};

        // Loop through periods and students to restructure the attendance data
        for (const period of attendance.periods) {
            for (const studentEntry of period.students) {
                const sId = studentEntry.studentId._id.toString();

                // If the student is not already in the map, add them
                if (!studentMap[sId]) {
                    studentMap[sId] = {
                        studentId: sId,
                        name: studentEntry.studentId.Student_name, // Use Student_name
                        rollNumber: studentEntry.studentId.Roll_No, // Use Roll_No
                        periods: []
                    };
                }

                // Push the current period's attendance for the student
                studentMap[sId].periods.push({
                    period: period.period,
                    status: studentEntry.status,
                    remarks: studentEntry.remarks
                });
            }
        }

        // Convert the student map into an array of student-wise attendance data
        const studentWiseAttendance = Object.values(studentMap);

        return res.status(200).json({
            success: true,
            date: new Date(date).toISOString().split("T")[0], // Format date as YYYY-MM-DD
            attendance: studentWiseAttendance
        });

    } catch (error) {
        console.error("Attendance fetch error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
