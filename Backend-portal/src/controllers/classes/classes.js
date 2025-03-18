const mongoose = require('mongoose');
const Class = require('../../models/classes');
const Student = require('../../models/studentdata');
const Teacher = require('../../models/teacherdata');
const Subject = require('../../models/subjectdata');

// ✅ Create a class
const createClass = async (req, res) => {
  try {
    const { name, teacherId } = req.body;

    if (!name || !teacherId) {
      return res.status(400).json({ message: "Class name and teacher ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid teacher ID format" });
    }

    const newClass = new Class({ name, teacherId, students: [] });
    await newClass.save();
    
    res.json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const { studentIds } = req.body;
    
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
const getTeachersByIds = async (req, res) => {
  try {
    let { teacherIds } = req.body;

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

// ✅ Assign student to a class
const assignStudentToClass = async (req, res) => {
  try {
    const { studentIds, classId } = req.body; // Accept studentIds as an array

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid class ID format" });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "Invalid student IDs array" });
    }

    // Validate each studentId
    for (const id of studentIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid student ID: ${id}` });
      }
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Find students by IDs
    const students = await Student.find({ _id: { $in: studentIds } });

    if (students.length !== studentIds.length) {
      return res.status(404).json({ message: "Some students not found" });
    }

    // Add only new students (avoid duplicates)
    const newStudentIds = studentIds.filter((id) => !classData.students.includes(id));
    classData.students.push(...newStudentIds);

    // Update class and save
    await classData.save();

    // Update each student with classId
    await Student.updateMany({ _id: { $in: studentIds } }, { classId });

    res.json({ message: "Students assigned to class", classData });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// ✅ Assign teacher to a class
const assignTeacherToClass = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;

    if (![classId, teacherId].every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const classData = await Class.findById(classId);
    const teacher = await Teacher.findById(teacherId);

    if (!classData || !teacher) {
      return res.status(404).json({ message: "Class or Teacher not found" });
    }

    if (!classData.teachers.includes(teacherId)) {
      classData.teachers.push(teacherId);
      await classData.save();
    }

    if (!teacher.classes.includes(classId)) {
      teacher.classes.push(classId);
      await teacher.save();
    }

    res.json({ message: "Teacher assigned to class", classData, teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
const unassignStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid class or student ID format" });
    }

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: "Class not found" });

    // Remove student from class
    classData.students = classData.students.filter(id => id.toString() !== studentId);
    await classData.save();

    // Update student to remove classId
    await Student.findByIdAndUpdate(studentId, { $unset: { classId: "" } });

    res.json({ message: "Student unassigned successfully", classData });
  } catch (error) {
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


const getStudents = async (req, res) => {
  try {
      const grade = req.query.grade;
      console.log("Received grade filter:", grade);

      let filter = {};

      if (grade && grade !== "Unassigned") {
          filter.Grade_applying_for = grade;
      } else if (grade === "Unassigned") {
          // Ensure only students with NO assigned grade are returned
          filter = {
              $or: [
                  { Grade_applying_for: { $exists: false } }, // Field is missing
                  { Grade_applying_for: null }, // Field is null
                  { Grade_applying_for: "" }, // Empty string
                  { Grade_applying_for: "Unassigned" } // Explicitly marked as "Unassigned"
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



module.exports = {
  createClass,
  assignStudentToClass,
  assignSubjectToClass,
  assignTeacherToClass,
  assignSubjectToTeacher,
  getAllClass,
  getAllSubjects,
  getStudentsByIds,
  getTeachersByIds,
  getClassById,
  unassignStudentFromClass,
  updateStudentGrade,
  getStudents
};
