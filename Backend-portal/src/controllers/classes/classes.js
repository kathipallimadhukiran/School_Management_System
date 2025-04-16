const mongoose = require('mongoose');
const {Class} = require('../../models/classes');
const Student = require('../../models/studentdata');
const Teacher = require('../../models/teacherdata');
const Subject = require('../../models/subjectdata');


const createClass = async (req, res) => {
  try {
    const { name, sections } = req.body;

    if (!name || !sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ message: "Class name and at least one section are required." });
    }

    const newClass = new Class({ name, sections });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: error.message });
  }
};





// ✅ Get class by ID (Fixed)
const getClassById = async (req, res) => {
  try {
      const { classId } = req.params; // Use req.params instead of req.body

    console.log(classId)

      const classData = await Class.findById(classId)
         
      if (!classData) {
          return res.status(404).json({ message: "Class not found" });
      }

      res.json(classData);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};



// ✅ Get students by IDs
const getStudentsByIds = async (req, res) => {
  try {
    const {studentIds } = req.body;
    
    console.log(studentIds)

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "Invalid student IDs provided" });
    }

    const students = await Student.find({ _id: { $in: studentIds } });

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get teacher(s) by ID(s)
const  getTeachersByIds = async (req, res) => {
  try {
    let { teacherIds } = req.body;
    console.log(teacherIds);

    if (!teacherIds) {
      return res.status(400).json({ message: "Teacher ID(s) required" });
    }

    if (!Array.isArray(teacherIds)) {
      teacherIds = [teacherIds];
    }

    if (!teacherIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid Teacher ID format" });
    }

    const teachers = await Teacher.find({ _id: { $in: teacherIds } });

    if (teachers.length === 0) {
      return res.status(404).json({ message: "No teacher(s) found" });
    }

    res.json(teacherIds.length === 1 ? teachers[0] : teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get assigned classes for a specific teacher
const getAssignedClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Teacher ID format"
      });
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const result = [];

    for (const assignment of teacher.assignedClasses) {
      const classDoc = await Class.findById(assignment.classId).lean();
      if (!classDoc) continue;

      const section = classDoc.sections.find(
        (sec) => sec._id.toString() === assignment.sectionId.toString()
      );

      if (!section) continue;

      // Check if class already exists in result
      let existingClass = result.find((c) => c._id.toString() === classDoc._id.toString());

      const sectionData = {
        _id: section._id,
        name: section.name
      };

      if (existingClass) {
        existingClass.sections.push(sectionData);
      } else {
        result.push({
          _id: classDoc._id,
          name: classDoc.name,
          sections: [sectionData]
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in getAssignedClasses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching assigned classes",
      error: error.message
    });
  }
};


// ✅ Assign student to a class
const assignStudentsToSection = async (req, res) => {
  try {
    const { studentIds, classId, sectionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({ message: "Invalid class or section ID format" });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "Invalid student IDs array" });
    }

    for (const id of studentIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid student ID: ${id}` });
      }
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const section = classData.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found in class" });
    }

    // Validate students
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ message: "Some students not found" });
    }

    // Filter out already assigned students
    const newStudentIds = studentIds.filter((id) => !section.students.includes(id));
    section.students.push(...newStudentIds);

    // Save updated class
    await classData.save();

    // Update students' class assignment if needed
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { classId } // Optionally add sectionId if needed
    );

    res.status(200).json({ message: "Students assigned to section", section });
  } catch (error) {
    console.error("Error assigning students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// ✅ Assign subject to a class
const assignSubjectToClass = async (req, res) => {
  try {
    const { classId, subjectId, teacherId } = req.body;

    if (![classId, subjectId, teacherId].every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const classData = await Class.findById(classId);
    const subject = await Subject.findById(subjectId);

    if (!classData) return res.status(404).json({ message: "Class not found" });
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    classData.subjects.push({ subjectId, teacherId });
    await classData.save();

    res.json({ message: "Subject assigned to class", classData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const assignTeacherToSection = async (req, res) => {
  try {
    const { classId, sectionId, teacherId } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ error: "Class not found" });

    const section = classData.sections.id(sectionId);
    if (!section) return res.status(404).json({ error: "Section not found" });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    // Assign teacher to the section
    section.teacherId = teacher._id;

    try {
      await classData.save();
    } catch (saveErr) {
      console.error("Save error:", saveErr);
    }

    // Push class-section pair if not already assigned
    const alreadyAssigned = teacher.assignedClasses.some(assignment =>
      assignment.classId.toString() === classId.toString() &&
      assignment.sectionId.toString() === sectionId.toString()
    );

    if (!alreadyAssigned) {
      teacher.assignedClasses.push({ classId, sectionId });
    }

    teacher.classId = classId;
    teacher.ClassTeacher = `${classData.name} - Section ${section.name}`;

    await teacher.save();

    res.status(200).json({ message: "Teacher assigned to section successfully", section });

  } catch (error) {
    console.error("Error assigning teacher to section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Assign subject to teacher
const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.body;

    if (![teacherId, subjectId].every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const teacher = await Teacher.findById(teacherId);
    const subject = await Subject.findById(subjectId);

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (!teacher.subjects.includes(subjectId)) {
      teacher.subjects.push(subjectId);
      teacher.subjectSpecialization ||= subject.name; // Assign specialization if empty
      await teacher.save();
    }

    res.json({ message: "Subject assigned to teacher", teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all classes
const getAllClass = async (req, res) => {
  try {
    const totalClasses = await Class.find();
    res.json(totalClasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};










// controllers/classController.js


const getSectionDetails = async (req, res) => {
  const { sectionId } = req.params;

  try {
    const classData = await Class.findOne({ "sections._id": sectionId });

    if (!classData) {
      return res.status(404).json({ message: "Section not found" });
    }

    const section = classData.sections.id(sectionId);

    if (!section) {
      return res.status(404).json({ message: "Section not found in class" });
    }

    // Fetch teacher details if assigned
    let teacherData = null;
    if (section.teacherId) {
      teacherData = await Teacher.findById(section.teacherId).select("name email phone ClassTeacher staffID");
    }

    const sectionData = {
      sectionId: section._id,
      sectionName: section.name,
      gradeLevel: section.gradeLevel,
      classID: classData.classID,
      className: classData.name,
      teacher: teacherData,
      students: section.students || [],
      subjects: section.subjects.map((subj) => ({
        subject: subj.subjectId,
        teacher: subj.teacherId,
      })),
    };

    return res.json(sectionData);
  } catch (error) {
    console.error("Error fetching section:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};














// ✅ Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teachers', 'name email');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Unassign student from a class
const unassignStudentFromSection = async (req, res) => {
  try {
    const { classId, sectionId, studentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(sectionId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({ message: "Invalid class, section or student ID format" });
    }

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: "Class not found" });

    const section = classData.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    // Remove student from the section
    section.students = section.students.filter(id => id.toString() !== studentId);
    await classData.save();

    // Optionally update student's classId (only if they no longer belong to any section)
    const stillAssigned = classData.sections.some(sec => 
      sec.students.some(sid => sid.toString() === studentId)
    );

    if (!stillAssigned) {
      await Student.findByIdAndUpdate(studentId, { $unset: { classId: "" } });
    }

    res.json({ message: "Student unassigned from section successfully", section });

  } catch (error) {
    console.error("Error unassigning student:", error);
    res.status(500).json({ error: error.message });
  }
};







const updateStudentGrade = async (req, res) => {
  try {
      const { studentId } = req.params;
      const { newGrade } = req.body; // Change key to match frontend request

      const updatedStudent = await Student.findByIdAndUpdate(
          studentId,
          { Grade_applying_for: newGrade }, // Correct field name
          { new: true } // Return updated document
      );

      if (!updatedStudent) {
          return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json(updatedStudent);
  } catch (error) {
      res.status(500).json({ message: "Error updating grade", error });
  }
};


const getStudentswhounassigned = async (req, res) => {
  try {
      const grade = req.query.grade;


      let filter = {};

      if (grade && grade !== "Unassigned") {
          filter.Grade_applying_for = grade;
      } else if (grade === "Unassigned") {
          filter = {
              $or: [
                  { Grade_applying_for: { $exists: false } },
                  { Grade_applying_for: null },
                  { Grade_applying_for: "" },
                  { Grade_applying_for: { $regex: /^unassigned$/i } }, // Case-insensitive match
              ]
          };
      }

      console.log("MongoDB filter:", JSON.stringify(filter, null, 2));

      const students = await Student.find(filter);
      console.log("Filtered students count:", students.length);

      res.status(200).json({ data: students });
  } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Error fetching students", error });
  }
};





const deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    const deletedSubject = await Subject.findByIdAndDelete(subjectId);
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    res.json({ message: `Subject "${deletedSubject.name}" deleted successfully!` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addSubject = async (req, res) => {
  try {
    const { name, code, teacherIds } = req.body; // Accept name, code, and optional teacherIds

    if (!name || !code) {
      return res.status(400).json({ message: "Subject name and code are required." });
    }

    // Validate teacher IDs (if provided)
    if (teacherIds && !Array.isArray(teacherIds)) {
      return res.status(400).json({ message: "Teacher IDs must be an array." });
    }

    if (teacherIds && !teacherIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid teacher ID format." });
    }

    // Create new subject
    const newSubject = new Subject({
      name,
      code,
      teachers: teacherIds || [], // Store teacher IDs if provided
    });

    await newSubject.save();

    res.status(201).json({ message: "Subject added successfully!", subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};









const getsectionstudentlist= async (req, res) => {
  try {
    const sectionId = req.params.sectionId;

    // Find the class and locate the section
    const classDoc = await Class.findOne({ "sections._id": sectionId });

    if (!classDoc) return res.status(404).json({ message: "Section not found" });

    const section = classDoc.sections.id(sectionId);
    const studentIds = section.students || [];

    // Get student details
    const students = await Student.find({ _id: { $in: studentIds } });

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




const assignRollNumbersToStudents = async (req, res) => {
  try {
    const { sectionId, studentIds, startFrom } = req.body;

    if (!sectionId || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const bulkOps = studentIds.map((studentId, index) => ({
      updateOne: {
        filter: { _id: studentId },
        update: { $set: { Roll_No: String(startFrom + index) } } // or remove `String()` if type is Number
      }
    }));

    const result = await Student.bulkWrite(bulkOps);

    res.status(200).json({ message: "Roll numbers assigned successfully", result });
  } catch (error) {
    console.error("Failed to assign roll numbers:", error);
    res.status(500).json({ message: "Error assigning roll numbers" });
  }
};







module.exports = {
  createClass,
  getsectionstudentlist,
  assignStudentsToSection,
  assignSubjectToClass,
  assignTeacherToSection,
  assignSubjectToTeacher,
  getAllClass,
  getSectionDetails,
  addSubject,
  getAllSubjects,
  getStudentsByIds,
  getTeachersByIds,
  getClassById,
  unassignStudentFromSection,
  updateStudentGrade,
  deleteSubject,
  getStudentswhounassigned,
  assignRollNumbersToStudents,
  getAssignedClasses
};
