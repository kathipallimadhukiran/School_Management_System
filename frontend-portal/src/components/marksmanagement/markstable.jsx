import React from "react";
import styles from "./MarksManagement.module.css";


const MarksTable = ({ students, selectedSubjects, marks, getStudentTotalAndPercentage, handleMarksChange }) => {
  const getGradeClass = (grade) => {
    switch(grade) {
      case 'A+': return styles.gradeA;
      case 'A': return styles.gradeA;
      case 'B': return styles.gradeB;
      case 'C': return styles.gradeC;
      case 'D': return styles.gradeD;
      case 'F': return styles.gradeF;
      default: return '';
    }
  };

  return (
    <div className={styles.marksTableContainer}>
      <table className={styles.marksTable}>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student Name</th>
            {selectedSubjects.flatMap(subject =>
              subject.divisions.map((div, idx) => (
                <th key={`${subject._id}-${idx}`}>
                  {subject.name} ({div.name})
                  <div className={styles.maxMarksLabel}>Max: {div.maxMarks}</div>
                </th>
              ))
            )}
            <th>Total</th>
            <th>Percentage</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const { totalMarks, percentage, grade } = getStudentTotalAndPercentage(student._id);
            const gradeClass = getGradeClass(grade); // Get grade-specific class
            
            return (
              <tr key={student._id}>
                <td>{student.Roll_No}</td>
                <td>{student.Student_name}</td>
                
                {selectedSubjects.flatMap(subject =>
                  subject.divisions.map((div, idx) => (
                    <td key={`${student._id}-${subject._id}-${idx}`}>
                      <div className={styles.marksInputContainer}>
                        <input
                          type="number"
                          min={0}
                          max={div.maxMarks}
                          value={marks[student._id]?.[subject._id]?.[idx] || ""}
                          onChange={(e) => 
                            handleMarksChange(student._id, subject._id, idx, e.target.value)
                          }
                          className={styles.marksInput}
                        />
                        <span className={styles.maxMarks}>/{div.maxMarks}</span>
                      </div>
                    </td>
                  ))
                )}
                
                <td>{totalMarks}</td>
                <td>{percentage}%</td>
                <td className={`${styles.grades} ${gradeClass}`}>{grade}</td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MarksTable;
