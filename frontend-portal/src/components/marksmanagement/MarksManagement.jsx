import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CSVLink } from "react-csv";
import MarksTable from "./markstable";
import styles from "./MarksManagement.module.css";
import { toast } from 'react-toastify';

// Icons
import { FiUpload, FiDownload, FiSave, FiX, FiPlus, FiMinus, FiTrash2, FiCheck } from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardList } from "react-icons/fa";

// Constants
const EXAM_TYPES = ["Midterm", "Final", "Assignment"];
const API_URL = import.meta.env.VITE_API_URL;

const MarksManagement = () => {
  // State management
  const [state, setState] = useState({
    classes: [],
    sections: [],
    selectedClassId: "",
    selectedSectionId: "",
    selectedSectionName: "",
    students: [],
    allsubjects: [],
    selectedSubjects: [],
    marks: {},
    examType: "Midterm",
    isLoading: false,
    successMessage: "",
    error: "",
    csvData: [],
    showImportModal: false,
    csvFile: null,
    isFetchingMarks: false
  });

  // Destructure state
  const {
    classes, sections, selectedClassId, selectedSectionId, selectedSectionName,
    students, allsubjects, selectedSubjects, marks, examType, isLoading,
    successMessage, error, csvData, showImportModal, csvFile, isFetchingMarks
  } = state;

  // Helper function to update state
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Memoized derived values
  const selectedClass = useMemo(() => 
    classes.find(c => c._id === selectedClassId), 
    [classes, selectedClassId]
  );

  const selectedSection = useMemo(() => 
    sections.find(s => s._id === selectedSectionId), 
    [sections, selectedSectionId]
  );

  // API call helper
  const fetchData = async (endpoint, errorMsg) => {
    try {
      updateState({ isLoading: true });
      const response = await fetch(`${API_URL}/${endpoint}`);
      if (!response.ok) throw new Error(errorMsg);
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      updateState({ error: errorMsg });
      return null;
    } finally {
      updateState({ isLoading: false });
    }
  };

  // Fetch classes on component mount
  useEffect(() => {
    const loadClasses = async () => {
      const data = await fetchData("getAllClass", "Failed to load classes. Please try again.");
      if (data) updateState({ classes: data });
    };
    loadClasses();
  }, []);

  // Update sections when class changes
  useEffect(() => {
    updateState({ 
      sections: selectedClass?.sections || [],
      selectedSectionId: "",
      students: [],
      allsubjects: [],
      selectedSubjects: [],
      selectedSectionName: "",
      marks: {}
    });
  }, [selectedClass]);

  // Fetch students and subjects when section changes
  useEffect(() => {
    const loadSectionData = async () => {
      if (!selectedSectionId) return;
      
      updateState({ isLoading: true, error: "" });
      
      try {
        const [studentsData, subjectsData] = await Promise.all([
          fetchData(`${selectedSectionId}/students`, "Failed to load students"),
          fetchData("getAllsubjects", "Failed to load subjects")
        ]);

        if (studentsData && subjectsData) {
          updateState({ 
            students: studentsData,
            allsubjects: subjectsData,
            selectedSectionName: selectedSection?.name || "",
            error: studentsData.length === 0 ? "No students available in this section." : "",
            marks: {}
          });
        }
      } catch (err) {
        console.error("Error loading section data:", err);
        updateState({ error: "Failed to load section data. Please try again." });
      } finally {
        updateState({ isLoading: false });
      }
    };

    loadSectionData();
  }, [selectedSectionId, selectedSection]);




const fetchMarks = useCallback(async () => {
  if (!selectedClassId || !selectedSectionId || !examType || selectedSubjects.length === 0) {
    return;
  }

  updateState({ isFetchingMarks: true, error: "" });

  try {
    const subjectIds = selectedSubjects.map(sub => sub._id).join(',');
    const response = await fetch(
      `${API_URL}/getmarks?classId=${selectedClassId}&sectionId=${selectedSectionId}&examType=${examType}&subjectIds=${subjectIds}`
    );

    if (response.status === 404) {
      console.warn("No marks found yet for this class/section/exam/subjects");
      updateState({
        marks: {},
        isFetchingMarks: false,
        error: ""
      });
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch marks");

    const marksData = await response.json();
    const formattedMarks = {};
    const shownSubjects = new Set(); // Track shown subjects only

    marksData.data.forEach((record) => {
      if (!formattedMarks[record.studentId]) {
        formattedMarks[record.studentId] = {};
      }

      record.subjects.forEach(subject => {
        if (selectedSubjects.some(s => s._id === subject.subjectId)) {
          if (!formattedMarks[record.studentId][subject.subjectId]) {
            formattedMarks[record.studentId][subject.subjectId] = {};
          }

          subject.divisions.forEach((division, idx) => {
            formattedMarks[record.studentId][subject.subjectId][idx] = division.marks;
          });

          // Only show toast if we haven't shown it for this subject yet
          const subjectKey = `${subject.subjectId}-${examType}`;
          if (subject.teacherName && !shownSubjects.has(subjectKey)) {
            shownSubjects.add(subjectKey);
            toast.info(`Marks for ${subject.name} already entered by ${subject.teacherName}`, {
              toastId: subjectKey // Use a unique ID to prevent duplicates
            });
          }
        }
      });
    });

    updateState({
      marks: formattedMarks,
      isFetchingMarks: false
    });
  } catch (err) {
    console.error("Error fetching marks:", err);
    updateState({
      isFetchingMarks: false,
      error: "Failed to load existing marks. Please try again."
    });
  }
}, [selectedClassId, selectedSectionId, examType, selectedSubjects]);

  


  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMarks();
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedClassId, selectedSectionId, examType, selectedSubjects, fetchMarks]);

  // Calculate student totals
  const getStudentTotalAndPercentage = useCallback((studentId) => {
    let totalMarks = 0;
    let totalMax = 0;
  
    selectedSubjects.forEach((subject) => {
      subject.divisions.forEach((div, idx) => {
        const val = parseFloat(marks[studentId]?.[subject._id]?.[idx] || 0);
        totalMarks += val;
        totalMax += div.maxMarks;
      });
    });
  
    const percentage = totalMax ? ((totalMarks / totalMax) * 100).toFixed(2) : 0;
    let grade = "";
  
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "F";
  
    return { totalMarks, percentage, grade };
  }, [selectedSubjects, marks]);

  // Subject management handlers
  const handleSubjectSelection = useCallback(async (subjectId) => {
    if (selectedSubjects.some(s => s._id === subjectId)) return;
  
    const subject = allsubjects.find(s => s._id === subjectId);
    if (!subject) return;
  
    try {
      updateState({ isLoading: true });
      
      // Fetch existing divisions for this subject if any
      const response = await fetch(
        `${API_URL}/getSubjectDivisions?subjectId=${subjectId}`
      );
      
      let divisions = [{ name: "Main", maxMarks: 100 }]; // Default division
      
      if (response.ok) {
        const data = await response.json();
        if (data.divisions && data.divisions.length > 0) {
          divisions = data.divisions;
        }
      }
  
      updateState({
        selectedSubjects: [
          ...selectedSubjects,
          {
            ...subject,
            divisions: divisions
          },
        ]
      });
      
    } catch (err) {
      console.error("Error fetching subject divisions:", err);
      // Fallback to default division if fetch fails
      updateState({
        selectedSubjects: [
          ...selectedSubjects,
          {
            ...subject,
            divisions: [{ name: "Main", maxMarks: 100 }]
          },
        ]
      });
    } finally {
      updateState({ isLoading: false });
    }
  }, [allsubjects, selectedSubjects]);

  const updateDivision = useCallback((subjectId, index, key, value) => {
    updateState({
      selectedSubjects: selectedSubjects.map(subj =>
        subj._id === subjectId ? {
          ...subj,
          divisions: subj.divisions.map((div, i) =>
            i === index ? { 
              ...div, 
              [key]: key === "maxMarks" ? +value : value 
            } : div
          ),
        } : subj
      )
    });
  }, [selectedSubjects]);

  const addDivision = useCallback((subjectId) => {
    updateState({
      selectedSubjects: selectedSubjects.map(subj =>
        subj._id === subjectId ? {
          ...subj,
          divisions: [...subj.divisions, { name: "", maxMarks: 0 }],
        } : subj
      )
    });
  }, [selectedSubjects]);

  const removeDivision = useCallback((subjectId, indexToRemove) => {
    const updatedSubjects = selectedSubjects.map(subj =>
      subj._id === subjectId ? {
        ...subj,
        divisions: subj.divisions.filter((_, i) => i !== indexToRemove),
      } : subj
    );

    const updatedMarks = { ...marks };
    Object.keys(updatedMarks).forEach(studentId => {
      if (updatedMarks[studentId]?.[subjectId]) {
        const { [indexToRemove]: _, ...remainingDivisions } = updatedMarks[studentId][subjectId];
        updatedMarks[studentId][subjectId] = Object.values(remainingDivisions).reduce((acc, val, i) => {
          acc[i] = val;
          return acc;
        }, {});
      }
    });

    updateState({
      selectedSubjects: updatedSubjects,
      marks: updatedMarks
    });
  }, [selectedSubjects, marks]);

  const removeSubject = useCallback((subjectId) => {
    const updatedMarks = { ...marks };
    Object.keys(updatedMarks).forEach(studentId => {
      if (updatedMarks[studentId]?.[subjectId]) {
        delete updatedMarks[studentId][subjectId];
      }
    });

    updateState({
      selectedSubjects: selectedSubjects.filter(s => s._id !== subjectId),
      marks: updatedMarks
    });
  }, [selectedSubjects, marks]);

  // Marks input handler
  const handleMarksChange = useCallback((studentId, subjectId, divIndex, value) => {
    const division = selectedSubjects
      .find(s => s._id === subjectId)
      ?.divisions[divIndex];
  
    const max = division?.maxMarks || 0;
    const num = Number(value);
  
    if (num > max) return;
  
    updateState({
      marks: {
        ...marks,
        [studentId]: {
          ...marks[studentId],
          [subjectId]: {
            ...marks[studentId]?.[subjectId],
            [divIndex]: num,
          },
        },
      }
    });
  }, [selectedSubjects, marks]);

  // Submit marks
  const handleSubmit = useCallback(async () => {
    if (!selectedClassId || !selectedSectionId || selectedSubjects.length === 0) {
      updateState({ error: "Please select Class, Section, and at least one Subject." });
      return;
    }
  
    const email = localStorage.getItem("email");
    const TeacherName = localStorage.getItem("userName");

    if (!email) {
      updateState({ error: "User session expired. Please log in again." });
      return;
    }
  
    const password = prompt("Please enter your password to confirm submission:");
    if (password === null) return;
    if (!password) {
      updateState({ error: "Password cannot be empty." });
      return;
    }
  
    updateState({ isLoading: true, error: "" });
  
    try {
      // Verify password first
      const authResponse = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.message || "Password verification failed");
      }
  
      // Process students one at a time with delay
      const results = [];
      for (const student of students) {
        try {
          const studentMarks = marks[student._id] || {};
          
          // Prepare subjects data
          const subjectsData = selectedSubjects.map(subject => {
            const divisions = subject.divisions.map((div, idx) => {
              const markValue = Number(studentMarks[subject._id]?.[idx] || 0);
              if (isNaN(markValue)) {
                throw new Error(`Invalid marks for ${subject.name} - ${div.name}`);
              }
              return {
                name: div.name,
                marks: markValue,
                maxMarks: Number(div.maxMarks)
              };
            });
            
            return {
              name: subject.name,
              subjectId: subject._id,
              divisions
            };
          });
  
          const payload = {
            classId: selectedClassId,
            className: selectedClass?.name || "",
            sectionId: selectedSectionId,
            sectionName: selectedSection?.name || "",
            studentId: student._id,
            studentName: student.Student_name,
            examType,
            TeacherName: TeacherName,
            subjects: subjectsData,
            authToken: localStorage.getItem("token")
          };
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const response = await fetch(`${API_URL}/marks`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(payload),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to save marks for ${student.Student_name}`);
          }
  
          results.push({ success: true, student: student.Student_name });
          
        } catch (err) {
          results.push({ success: false, student: student.Student_name, error: err.message });
        }
      }
  
      // Analyze results
      const failed = results.filter(r => !r.success);
      const succeeded = results.filter(r => r.success);
  
      if (failed.length > 0) {
        updateState({ 
          isLoading: false,
          error: `${failed.length} student submissions failed out of ${students.length}. ` +
                 `First error: ${failed[0].error}`
        });
      } else {
        updateState({
          isLoading: false,
          successMessage: `Marks saved successfully for ${succeeded.length} students!`,
          marks: {},
        });
        setTimeout(() => updateState({ successMessage: "" }), 5000);
      }
  
    } catch (err) {
      console.error("Error saving marks:", err);
      updateState({ 
        isLoading: false,
        error: err.message || "Failed to save marks. Please try again." 
      });
    }
  }, [selectedClassId, selectedSectionId, selectedClass, selectedSection, selectedSubjects, marks, examType, students]);

  // CSV Export Functions
  const generateCsvData = useCallback(() => {
    if (students.length === 0 || selectedSubjects.length === 0) return { headers: [], data: [] };

    const headers = [
      { label: "Roll No", key: "rollNo" },
      { label: "Student Name", key: "studentName" },
      ...selectedSubjects.flatMap(subject => 
        subject.divisions.map((div, idx) => ({
          label: `${subject.name} (${div.name})`,
          key: `${subject._id}-${idx}`
        }))
      ),
      { label: "Total", key: "total" },
      { label: "Percentage", key: "percentage" },
      { label: "Grade", key: "grade" }
    ];

    const data = students.map(student => {
      const { totalMarks, percentage, grade } = getStudentTotalAndPercentage(student._id);
      
      const row = {
        rollNo: student.Roll_No || "-",
        studentName: student.Student_name,
        total: totalMarks,
        percentage: `${percentage}%`,
        grade: grade,
        ...selectedSubjects.flatMap(subject => 
          subject.divisions.map((div, idx) => ({
            [`${subject._id}-${idx}`]: marks[student._id]?.[subject._id]?.[idx] || ""
          }))
        ).reduce((acc, val) => ({ ...acc, ...val }), {})
      };

      return row;
    });

    return { headers, data };
  }, [students, selectedSubjects, marks, getStudentTotalAndPercentage]);

  // Update csvData when marks change
  useEffect(() => {
    const csvInfo = generateCsvData();
    updateState({ csvData: csvInfo.data || [] });
  }, [generateCsvData]);

  // CSV Import Functions
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    updateState({ 
      csvFile: file,
      showImportModal: true 
    });
  };

  const processCSVData = (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const updatedMarks = { ...marks };
    
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
      if (currentLine.length !== headers.length) continue;

      const [rollNo, studentName] = currentLine;
      const student = students.find(s => 
        s.Roll_no === rollNo || s.Student_name === studentName
      );
      
      if (!student) continue;
      
      if (!updatedMarks[student._id]) {
        updatedMarks[student._id] = {};
      }
      
      for (let j = 2; j < headers.length - 3; j++) {
        const [subjectName, divName] = headers[j].split(' (');
        const cleanDivName = divName?.replace(')', '');
        
        const subject = selectedSubjects.find(s => s.name === subjectName);
        if (!subject) continue;
        
        const divIndex = subject.divisions.findIndex(d => d.name === cleanDivName);
        if (divIndex === -1) continue;
        
        const markValue = parseFloat(currentLine[j]) || 0;
        
        if (!updatedMarks[student._id][subject._id]) {
          updatedMarks[student._id][subject._id] = {};
        }
        
        updatedMarks[student._id][subject._id][divIndex] = markValue;
      }
    }
    
    updateState({
      marks: updatedMarks,
      showImportModal: false,
      csvFile: null,
      successMessage: "Marks imported successfully!"
    });
    setTimeout(() => updateState({ successMessage: "" }), 3000);
  };

  const handleImportConfirm = () => {
    if (!csvFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => processCSVData(e.target.result);
    reader.readAsText(csvFile);
  };

  // Render helper components
  const renderDropdown = (title, value, options, onChange, optionKey = "_id", optionLabel = "name", icon) => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {icon && <span className={styles.cardIcon}>{icon}</span>}
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <div className={styles.dropdown}>
        <select 
          value={value} 
          onChange={onChange}
          className={styles.selectInput}
        >
          <option value="">-- Select {title} --</option>
          {options.map(option => (
            <option key={option[optionKey]} value={option[optionKey]}>
              {option[optionLabel]}
            </option>
          ))}
        </select>
        <span className={styles.dropdownArrow}>▼</span>
      </div>
    </div>
  );

  const renderExamTypeSelector = () => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}><FaClipboardList /></span>
        <h3 className={styles.cardTitle}>Exam Type</h3>
      </div>
      <div className={styles.radioGroup}>
        {EXAM_TYPES.map(type => (
          <label key={type} className={styles.radioLabel}>
            <input
              type="radio"
              name="examType"
              value={type}
              checked={examType === type}
              onChange={() => {
                updateState({ examType: type });
                fetchMarks();
              }}
              className={styles.radioInput}
            />
            <span className={styles.radioCustom}></span>
            {type}
          </label>
        ))}
      </div>
    </div>
  );

  const renderSubjectCards = () => (
    <div className={styles.subjectsContainer}>
      <h3 className={styles.sectionTitle}>
        <FaChalkboardTeacher className={styles.sectionIcon} />
        Selected Subjects
      </h3>
      <div className={styles.subjectCards}>
        {selectedSubjects.map(subject => (
          <div key={subject._id} className={styles.subjectCard}>
            <div className={styles.subjectHeader}>
              <h4>{subject.name}</h4>
              <button 
                onClick={() => removeSubject(subject._id)} 
                className={styles.removeButton}
                title="Remove subject"
              >
                <FiTrash2 />
              </button>
            </div>
            
            <div className={styles.divisionsList}>
              {subject.divisions.map((div, index) => (
                <div key={index} className={styles.divisionItem}>
                  <div className={styles.divisionHeader}>
                    <span>Division {index + 1}</span>
                    {subject.divisions.length > 1 && (
                      <button 
                        onClick={() => removeDivision(subject._id, index)} 
                        className={styles.removeDivisionButton}
                        title="Remove division"
                      >
                        <FiMinus />
                      </button>
                    )}
                  </div>
                  <div className={styles.divisionInputs}>
                    <div className={styles.inputGroup}>
                      <label>Name</label>
                      <input
                        type="text"
                        placeholder="Division Name"
                        value={div.name}
                        onChange={(e) => updateDivision(subject._id, index, "name", e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Max Marks</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="Max Marks"
                        value={div.maxMarks}
                        onChange={(e) => updateDivision(subject._id, index, "maxMarks", e.target.value)}
                        className={styles.numberInput}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => addDivision(subject._id)} 
              className={styles.addButton}
            >
              <FiPlus /> Add Division
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderImportModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Import Marks from CSV</h3>
          <button 
            onClick={() => updateState({ showImportModal: false })} 
            className={styles.modalCloseButton}
          >
            <FiX />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p>Are you sure you want to import marks from this file? This will overwrite existing marks.</p>
          <div className={styles.fileInfo}>
            <FiUpload className={styles.fileIcon} />
            <span>{csvFile?.name}</span>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            onClick={() => updateState({ showImportModal: false })} 
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button 
            onClick={handleImportConfirm} 
            className={styles.confirmButton}
          >
            <FiCheck /> Confirm Import
          </button>
        </div>
      </div>
    </div>
  );

  const renderExportButton = () => {
    const csvInfo = generateCsvData();
    return (
      <CSVLink
        data={csvInfo.data || []}
        headers={csvInfo.headers || []}
        filename={`marks_${selectedSectionName}_${examType}.csv`}
        className={styles.exportButton}
      >
        <FiDownload /> Export to CSV
      </CSVLink>
    );
  };

  const renderActionButtons = () => (
    <div className={styles.actionButtons}>
      <div className={styles.importButtonContainer}>
        <input
          type="file"
          id="csvImport"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <label htmlFor="csvImport" className={styles.importButton}>
          <FiUpload /> Import from CSV
        </label>
      </div>
      
      {csvData.length > 0 && renderExportButton()}
      
      <button 
        onClick={handleSubmit} 
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Saving...
          </>
        ) : (
          <>
            <FiSave /> Save Marks
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <FaUserGraduate className={styles.titleIcon} />
          Marks Management
        </h1>
        {selectedSectionName && (
          <div className={styles.currentSelection}>
            {selectedClass?.name} • {selectedSectionName} • {examType}
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <div className={styles.errorContent}>
            {error}
          </div>
          <button 
            onClick={() => updateState({ error: "" })}
            className={styles.dismissButton}
          >
            <FiX />
          </button>
        </div>
      )}

      <div className={styles.selectionCards}>
        {renderDropdown("Class", selectedClassId, classes, e => 
          updateState({ selectedClassId: e.target.value }), 
          "_id", "name", <FaChalkboardTeacher />
        )}
        
        {sections.length > 0 && renderDropdown("Section", selectedSectionId, sections, e => 
          updateState({ selectedSectionId: e.target.value }),
          "_id", "name", <FaUserGraduate />
        )}
      </div>

      {selectedSectionId && (
        <>
          <div className={styles.examSection}>
            {renderExamTypeSelector()}
            
            {renderDropdown("Subject", "", 
              allsubjects.filter(sub => !selectedSubjects.some(s => s._id === sub._id)), 
              e => handleSubjectSelection(e.target.value),
              "_id", "name", <FaClipboardList />
            )}
          </div>

          {selectedSubjects.length > 0 && renderSubjectCards()}

          <div className={styles.marksSection}>
            <div className={styles.sectionHeader}>
              <h3>
                Entering marks for: <span className={styles.highlight}>{selectedSectionName}</span>
              </h3>
              {successMessage && (
                <div className={styles.successMessage}>
                  <FiCheck /> {successMessage}
                </div>
              )}
            </div>
            
            <MarksTable
              students={students}
              selectedSubjects={selectedSubjects}
              marks={marks}
              getStudentTotalAndPercentage={getStudentTotalAndPercentage}
              handleMarksChange={handleMarksChange}
            />

            {students.length > 0 && selectedSubjects.length > 0 && renderActionButtons()}
          </div>
        </>
      )}

      {showImportModal && renderImportModal()}

      {(isLoading || isFetchingMarks) && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>{isFetchingMarks ? "Loading marks..." : "Saving marks..."}</p>
        </div>
      )}
    </div>
  );
};

export default MarksManagement;