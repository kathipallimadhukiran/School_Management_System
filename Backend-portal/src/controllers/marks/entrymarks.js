const ClassMarks = require("../../models/marks");
const mongoose = require("mongoose");



const enterMarks = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      classId,
      className,
      sectionId,
      sectionName,
      studentId,
      studentName,
      TeacherName,
      examType,
      subjects,
    } = req.body;

    if (
      !classId ||
      !className ||
      !sectionId ||
      !sectionName ||
      !studentId ||
      !studentName ||
      !examType ||
      !TeacherName||
      !subjects?.length
    ) {
      throw new Error("Missing required fields or empty subjects array");
    }

    // Find class document
    let classDoc = await ClassMarks.findOne({ classId }).session(session);
    if (!classDoc) {
      classDoc = new ClassMarks({
        classId,
        className,
        sections: {},
      });
    }

 // Add/update section
if (!classDoc.sections.has(sectionId)) {
  classDoc.sections.set(sectionId, {
    sectionId,
    name: sectionName,
    students: new Map(),
    TeacherName: TeacherName // <-- Add teacher name here
  });
} else {
  // Update teacher name if needed (optional)
  const section = classDoc.sections.get(sectionId);
  section.TeacherName = TeacherName;
}


    const section = classDoc.sections.get(sectionId);

    // Add/update student
    if (!section.students.has(studentId)) {
      section.students.set(studentId, {
        studentId,
        name: studentName,
        exams: new Map(),
      });
    }

    const student = section.students.get(studentId);

    // Get existing exam or create new
    if (!student.exams.has(examType)) {
      student.exams.set(examType, {
        examType,
        subjects: new Map(),
      });
    }

    const exam = student.exams.get(examType);

    // Prepare new subjects data
    for (const subject of subjects) {
      const subjectData = {
        name: subject.name,
        subjectId: subject.subjectId,
        divisions: subject.divisions.map((div) => {
          if (div.marks === undefined || div.marks === null) {
            throw new Error(`Marks required for ${subject.name} - ${div.name}`);
          }
          return {
            name: div.name,
            marksObtained: Number(div.marks),
            maxMarks: Number(div.maxMarks),
          };
        }),
      };

      // Merge with existing subject if it exists
      if (exam.subjects.has(subject.subjectId)) {
        const existingSubject = exam.subjects.get(subject.subjectId);
        // Update only the divisions that were sent
        subjectData.divisions.forEach((newDivision, index) => {
          if (existingSubject.divisions[index]) {
            existingSubject.divisions[index] = newDivision;
          } else {
            existingSubject.divisions.push(newDivision);
          }
        });
      } else {
        // Add new subject
        exam.subjects.set(subject.subjectId, subjectData);
      }
    }

    // Save changes
    classDoc.markModified("sections");
    await classDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Marks saved successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error saving marks:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to save marks",
    });
  }
};




const getMarks = async (req, res) => {
  try {
    const { classId, sectionId, examType, subjectIds } = req.query;

    // Basic validation
    if (!classId || !sectionId || !examType) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: classId, sectionId, or examType"
      });
    }

    console.log(`Searching marks for class: ${classId}, section: ${sectionId}, exam: ${examType}`);

    // Convert classId to ObjectId
    const classDoc = await ClassMarks.findOne({ classId: new mongoose.Types.ObjectId(classId) });

    if (!classDoc) {
      console.log(`No class found with ID: ${classId}`);
      return res.status(200).json({
        success: true,
        message: "No records found for this class.",
        data: [] // Return empty array when no class is found
      });
    }

    // Get section
    const section = classDoc.sections?.get(sectionId);
    if (!section) {
      console.log(`No section found with ID: ${sectionId} in class ${classId}`);
      return res.status(200).json({
        success: true,
        message: "No section found with this ID.",
        data: [] // Return empty array when no section is found
      });
    }

    // Check if there are students in the section
    if (!section.students || section.students.size === 0) {
      console.log(`No students found in section ${sectionId}`);
      return res.status(200).json({
        success: true,
        message: "No students found in this section.",
        data: [] // Return empty array when no students are found
      });
    }

    // Check for missing subjectIds (if no subjects are provided, return early)
    const subjectIdsArray = subjectIds ? subjectIds.split(',') : [];
    if (subjectIdsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subjects selected."
      });
    }

    // Prepare response data
    const responseData = [];

    for (const [studentId, studentData] of section.students) {
      const exam = studentData.exams?.get(examType);
      if (!exam) continue;

      const studentMarks = {
        studentId,
        studentName: studentData.name,
        teacherName: section.TeacherName || "Teacher not assigned",
        subjects: []
      };

      for (const [subjectId, subjectData] of exam.subjects) {
        // If subject is selected, include its data
        if (subjectIdsArray.length && !subjectIdsArray.includes(subjectId.toString())) {
          continue;
        }

        const subjectMarks = {
          subjectId,
          name: subjectData.name,
          teacherName: section.TeacherName || "Teacher not assigned", // Include teacher name for each subject
          divisions: subjectData.divisions.map((div) => ({
            name: div.name,
            marks: div.marksObtained,
            maxMarks: div.maxMarks
          }))
        };

        studentMarks.subjects.push(subjectMarks);
      }

      if (studentMarks.subjects.length > 0) {
        responseData.push(studentMarks);
      }
    }

    // If no marks are found, but no error is raised, return empty data
    return res.status(200).json({
      success: true,
      message: responseData.length === 0 ? "No records found for the given students and subjects" : "Marks found successfully",
      data: responseData
    });

  } catch (err) {
    console.error("Error fetching marks:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch marks"
    });
  }
};







// In your backend controller
const getSubjectDivisions = async (req, res) => {
  try {
    const { subjectId } = req.query;
    
    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required"
      });
    }

    // Find one example of this subject being used to get its division structure
    const classMark = await ClassMarks.findOne({
      "sections.students.exams.subjects.subjectId": new mongoose.Types.ObjectId(subjectId)
    });

    if (!classMark) {
      // If no marks exist yet for this subject, return default divisions
      return res.status(200).json({
        success: true,
        divisions: [{ name: "Main", maxMarks: 100 }] // Default division
      });
    }

    // Find the subject in the nested structure
    let divisions = [];
    for (const [_, section] of classMark.sections) {
      for (const [_, student] of section.students) {
        for (const [_, exam] of student.exams) {
          for (const [_, subject] of exam.subjects) {
            if (subject.subjectId.toString() === subjectId) {
              divisions = subject.divisions;
              break;
            }
          }
          if (divisions.length > 0) break;
        }
        if (divisions.length > 0) break;
      }
      if (divisions.length > 0) break;
    }

    // If no divisions found (shouldn't happen if we found the subject), return default
    if (divisions.length === 0) {
      divisions = [{ name: "Main", maxMarks: 100 }];
    }

    res.status(200).json({
      success: true,
      divisions: divisions
    });
    
  } catch (err) {
    console.error("Error fetching subject divisions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subject divisions"
    });
  }
};

module.exports = {
  enterMarks,
  getMarks,
  getSubjectDivisions ,
};