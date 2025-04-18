import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PostAttendance.module.css';
import Modal from './Modal';

const PostAttendance = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [activePeriods, setActivePeriods] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [showSummary, setShowSummary] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const PERIODS = [1, 2, 3, 4, 5, 6, 7];

    // Check for mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => {
        if (showSummary) {
            const handleTabClick = (e) => {
                if (e.target.classList.contains(styles.tabButton)) {
                    // Toggle active tab
                    document.querySelectorAll(`.${styles.tabButton}`).forEach(btn => {
                        btn.classList.remove(styles.activeTab);
                    });
                    e.target.classList.add(styles.activeTab);
    
                    // Show corresponding content
                    const isPresentTab = e.target.textContent.includes('Present');
                    document.querySelector(`.${styles.presentList}`).style.display = 
                        isPresentTab ? 'block' : 'none';
                    document.querySelector(`.${styles.absentList}`).style.display = 
                        isPresentTab ? 'none' : 'block';
                }
            };
    
            const modal = document.querySelector(`.${styles.summaryContent}`);
            modal.addEventListener('click', handleTabClick);
    
            return () => {
                modal.removeEventListener('click', handleTabClick);
            };
        }
    }, [showSummary]);
    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get(`${API_URL}/getAllClass`);
                setClasses(res.data);
            } catch (err) {
                setError("Failed to load classes");
                console.error(err);
            }
        };
        fetchClasses();
    }, []);

    // Fetch sections when class changes
    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedClass) return;
            try {
                const res = await axios.get(`${API_URL}/getClassById/${selectedClass}`);
                setSections(res.data.sections || []);
                if (res.data.sections?.length) {
                    setSelectedSection(res.data.sections[0]._id);
                }
            } catch (err) {
                setError("Failed to load sections");
                console.error(err);
            }
        };
        fetchSections();
    }, [selectedClass]);

    // Fetch students when section changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedSection) return;
            try {
                const section = sections.find(s => s._id === selectedSection);
                if (!section?.students?.length) {
                    setStudents([]);
                    return;
                }

                const res = await axios.post(`${API_URL}/getStudentsByIds`, {
                    studentIds: section.students
                });

                setStudents(res.data);
                
                // Initialize attendance state
                const initialAttendance = {};
                res.data.forEach(student => {
                    initialAttendance[student._id] = PERIODS.reduce((acc, period) => {
                        acc[`P${period}`] = 'present'; // Default to present
                        return acc;
                    }, {});
                });
                setAttendance(initialAttendance);
            } catch (err) {
                setError("Failed to load students");
                console.error(err);
            }
        };
        fetchStudents();
    }, [selectedSection, sections]);

    const handlePeriodToggle = (period) => {
        setActivePeriods(prev => 
            prev.includes(period) 
                ? prev.filter(p => p !== period) 
                : [...prev, period]
        );
    };

    const handleSelectAllPeriods = (select) => {
        setActivePeriods(select ? PERIODS.map(p => `P${p}`) : []);
    };

    const handleAttendanceChange = (studentId, period, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [period]: status
            }
        }));
    };

    const toggleStudentStatusForAllPeriods = (studentId, status) => {
        const updatedAttendance = {...attendance};
        activePeriods.forEach(period => {
            updatedAttendance[studentId][period] = status;
        });
        setAttendance(updatedAttendance);
    };

   

    const generateSummary = () => {
        const summary = {
            total: students.length,
            present: 0,
            absent: 0,
            presentees: [],
            absentees: []
        };

        students.forEach(student => {
            const isPresent = activePeriods.every(period => 
                attendance[student._id]?.[period] === 'present'
            );

            if (isPresent) {
                summary.present++;
                summary.presentees.push({
                    id: student._id,
                    roll: student.Roll_No || student._id,
                    name: student.Student_name
                });
            } else {
                summary.absent++;
                summary.absentees.push({
                    id: student._id,
                    roll: student.Roll_No || student._id,
                    name: student.Student_name
                });
            }
        });

        return summary;
    };

    const validateSubmission = () => {
        if (!selectedClass || !selectedSection) {
            setError("Please select both class and section");
            return false;
        }
        if (activePeriods.length === 0) {
            setError("Please select at least one period");
            return false;
        }
        return true;
    };

    const submitAttendance = async () => {
        if (!validateSubmission()) return;
        
        const summary = generateSummary();
        setShowSummary(true);
    };

    const confirmSubmission = async () => {
        setShowSummary(false);
        setShowPassword(true);
    };

    const verifyAndSubmit = async () => {
        setLoading(true);
        setError('');
        
        try {
            const email = localStorage.getItem("email");
            if (!email) throw new Error("Session expired - Please login again");
    
            // Verify password
            const authRes = await axios.post(`${API_URL}/auth/verify`, { 
                email, 
                password 
            });
            
            if (!authRes.data?.success) {
                throw new Error(authRes.data?.message || "Invalid credentials");
            }
    
            // Prepare attendance data
            const periodMap = new Map();
            
            students.forEach(student => {
                activePeriods.forEach(period => {
                    if (!periodMap.has(period)) {
                        periodMap.set(period, []);
                    }
                    periodMap.get(period).push({
                        studentId: student._id,
                        status: attendance[student._id]?.[period] === 'present' ? 'Present' : 'Absent'
                    });
                });
            });
    
            const attendanceData = {
                classId: selectedClass,
                sectionId: selectedSection,
                date: new Date().toISOString().split('T')[0],
                markedBy: email,
                attendance: students.map(student => ({
                    studentId: student._id,
                    status: activePeriods.map(period => ({
                        period,
                        status: attendance[student._id]?.[period] === 'present' ? 'Present' : 'Absent'
                    }))
                }))
            };
    
            // Submit attendance
            const submissionRes = await axios.post(`${API_URL}/mark-Attendance`, attendanceData);
            
            // Reset on success
        window.location.reload()
            setPassword('');
            setShowPassword(false);
            alert("Attendance submitted successfully!");
            
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const renderMobileStudentCards = () => {
        return (
            <div className={styles.studentListMobile}>
                <div className={styles.periodHeader}>
                    <h4>Selected Periods: {activePeriods.join(', ')}</h4>
                   
                </div>
                
                {students.map((student, index) => (
                    <div key={student._id} className={styles.studentCard}>
                        <div className={styles.studentInfo}>
                            <span className={styles.studentNumber}>{index + 1}</span>
                            <span className={styles.studentRoll}>{student.Roll_No || '-'}</span>
                            <span className={styles.studentName}>{student.Student_name}</span>
                        </div>
                        
                        <div className={styles.periodGrid}>
                            {activePeriods.map(period => (
                                <div key={`${student._id}-${period}`} className={styles.periodItemMobile}>
                                    <span className={styles.periodLabel}>{period}</span>
                                    <button
                                        className={`${styles.attendanceToggle} ${
                                            attendance[student._id]?.[period] === 'present' 
                                                ? styles.present 
                                                : styles.absent
                                        }`}
                                        onClick={() => handleAttendanceChange(
                                            student._id,
                                            period,
                                            attendance[student._id]?.[period] === 'present' ? 'absent' : 'present'
                                        )}
                                    >
                                        {attendance[student._id]?.[period] === 'present' ? '✓' : '✗'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.studentActions}>
                            <button 
                                className={`${styles.actionButton} ${styles.presentAll}`}
                                onClick={() => toggleStudentStatusForAllPeriods(student._id, 'present')}
                            >
                                All Present
                            </button>
                            <button 
                                className={`${styles.actionButton} ${styles.absentAll}`}
                                onClick={() => toggleStudentStatusForAllPeriods(student._id, 'absent')}
                            >
                                All Absent
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderDesktopTable = () => {
        return (
            <div className={styles.tableWrapper}>
                <table className={styles.studentTable}>
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Roll No</th>
                            <th>Student Name</th>
                            {activePeriods.map(period => (
                                <th key={period}>{period}</th>
                            ))}
                            <th>Present All</th>
                            <th>Absent All</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student._id}>
                                <td>{index + 1}</td>
                                <td>{student.Roll_No || '-'}</td>
                                <td>{student.Student_name}</td>
                                {activePeriods.map(period => (
                                    <td key={`${student._id}-${period}`}>
                                        <input
                                            type="checkbox"
                                            checked={attendance[student._id]?.[period] === 'present'}
                                            onChange={(e) => 
                                                handleAttendanceChange(
                                                    student._id, 
                                                    period, 
                                                    e.target.checked ? 'present' : 'absent'
                                                )
                                            }
                                            className={styles.attendanceCheckbox}
                                        />
                                    </td>
                                ))}
                                <td>
                                    <button
                                        className={`${styles.statusButton} ${styles.presentButton}`}
                                        onClick={() => toggleStudentStatusForAllPeriods(student._id, 'present')}
                                    >
                                        Present All
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className={`${styles.statusButton} ${styles.absentButton}`}
                                        onClick={() => toggleStudentStatusForAllPeriods(student._id, 'absent')}
                                    >
                                        Absent All
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Student Attendance Management</h2>
            
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Class Information</h3>
                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <label className={styles.label}>Select Class</label>
                        <select 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.controlGroup}>
                        <label className={styles.label}>Select Section</label>
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className={styles.select}
                            disabled={!selectedClass}
                        >
                            <option value="">-- Select Section --</option>
                            {sections.map(sec => (
                                <option key={sec._id} value={sec._id}>{sec.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {students.length > 0 && (
                <>
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>Period Selection</h3>
                        <div className={styles.periodControls}>
                            <div className={styles.periodSelectAll}>
                                <input
                                    type="checkbox"
                                    id="selectAllPeriods"
                                    checked={activePeriods.length === PERIODS.length}
                                    onChange={(e) => handleSelectAllPeriods(e.target.checked)}
                                />
                                <label htmlFor="selectAllPeriods">Select All Periods</label>
                            </div>
                            
                            <div className={styles.periodList}>
                                {PERIODS.map(period => {
                                    const periodKey = `P${period}`;
                                    return (
                                        <div key={periodKey} className={styles.periodItem}>
                                            <input
                                                type="checkbox"
                                                id={`period-${period}`}
                                                checked={activePeriods.includes(periodKey)}
                                                onChange={() => handlePeriodToggle(periodKey)}
                                            />
                                            <label htmlFor={`period-${period}`}>
                                                Period {period}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>Student Attendance</h3>
                      

                        {isMobile ? renderMobileStudentCards() : renderDesktopTable()}
                    </div>

                    <div className={styles.formActions}>
                        <button 
                            className={styles.submitButton}
                            onClick={submitAttendance}
                            disabled={activePeriods.length === 0}
                        >
                            Submit Attendance
                        </button>
                    </div>
                </>
            )}

            {/* Summary Modal */}
            {showSummary && (
    <Modal
        title="Attendance Summary"
        onClose={() => setShowSummary(false)}
        onConfirm={confirmSubmission}
        confirmText="Confirm & Proceed"
        cancelText="Go Back"
        size="large"
    >
        <div className={styles.summaryContent}>
            <div className={styles.summaryHeader}>
                <div className={styles.summaryHeaderItem}>
                    <span className={styles.summaryLabel}>Class:</span>
                    <span className={styles.summaryValue}>{classes.find(c => c._id === selectedClass)?.name}</span>
                </div>
                <div className={styles.summaryHeaderItem}>
                    <span className={styles.summaryLabel}>Section:</span>
                    <span className={styles.summaryValue}>{sections.find(s => s._id === selectedSection)?.name}</span>
                </div>
                <div className={styles.summaryHeaderItem}>
                    <span className={styles.summaryLabel}>Date:</span>
                    <span className={styles.summaryValue}>{new Date().toLocaleDateString()}</span>
                </div>
                <div className={styles.summaryHeaderItem}>
                    <span className={styles.summaryLabel}>Periods:</span>
                    <span className={styles.summaryValue}>{activePeriods.join(', ')}</span>
                </div>
            </div>
            
            <div className={styles.summaryStats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <span className={styles.statLabel}>Total Students</span>
                    <span className={styles.statValue}>{generateSummary().total}</span>
                </div>
                <div className={`${styles.statCard} ${styles.presentCard}`}>
                    <div className={styles.statIcon}>✅</div>
                    <span className={styles.statLabel}>Present</span>
                    <span className={styles.statValue}>{generateSummary().present}</span>
                    <span className={styles.statPercentage}>
                        ({Math.round((generateSummary().present / generateSummary().total) * 100)}%)
                    </span>
                </div>
                <div className={`${styles.statCard} ${styles.absentCard}`}>
                    <div className={styles.statIcon}>❌</div>
                    <span className={styles.statLabel}>Absent</span>
                    <span className={styles.statValue}>{generateSummary().absent}</span>
                    <span className={styles.statPercentage}>
                        ({Math.round((generateSummary().absent / generateSummary().total) * 100)}%)
                    </span>
                </div>
            </div>
            
            <div className={styles.summaryTabs}>
                <button 
                    className={`${styles.tabButton} ${styles.activeTab}`}
                >
                    Present ({generateSummary().present})
                </button>
                <button 
                    className={`${styles.tabButton}`}
                >
                    Absent ({generateSummary().absent})
                </button>
            </div>
            
            <div className={styles.summaryLists}>
                <div className={styles.presentList}>
                    <div className={styles.scrollableList}>
                        <table className={styles.summaryTable}>
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {generateSummary().presentees.map((student, index) => (
                                    <tr key={student.id}>
                                        <td>{index + 1}</td>
                                        <td>{student.roll}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <span className={styles.presentBadge}>Present</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className={styles.absentList} style={{display: 'none'}}>
                    <div className={styles.scrollableList}>
                        <table className={styles.summaryTable}>
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {generateSummary().absentees.map((student, index) => (
                                    <tr key={student.id}>
                                        <td>{index + 1}</td>
                                        <td>{student.roll}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <span className={styles.absentBadge}>Absent</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className={styles.summaryConfirmation}>
                <div className={styles.confirmationText}>
                    <p>You're about to submit attendance for <strong>{generateSummary().total}</strong> students.</p>
                    <p>Please verify the information before proceeding.</p>
                </div>
                <div className={styles.confirmationButtons}>
                    <button 
                        className={styles.cancelButton}
                        onClick={() => setShowSummary(false)}
                    >
                        <span className={styles.buttonIcon}>←</span> Go Back
                    </button>
                    <button 
                        className={styles.confirmButton}
                        onClick={confirmSubmission}
                    >
                        Confirm Attendance <span className={styles.buttonIcon}>→</span>
                    </button>
                </div>
            </div>
        </div>
    </Modal>
)}

            {/* Password Modal */}
            {showPassword && (
                <Modal
                    title="Confirm Attendance Submission"
                    onClose={() => {
                        setShowPassword(false);
                        setPassword('');
                        setError('');
                    }}
                    showConfirm={false}
                >
                    <div className={styles.passwordModalContent}>
                        <p>You are about to submit attendance for:</p>
                        <ul className={styles.submissionDetails}>
                            <li>Class: <strong>{classes.find(c => c._id === selectedClass)?.name}</strong></li>
                            <li>Section: <strong>{sections.find(s => s._id === selectedSection)?.name}</strong></li>
                            <li>Date: <strong>{new Date().toLocaleDateString()}</strong></li>
                            <li>Periods: <strong>{activePeriods.join(', ')}</strong></li>
                        </ul>
                        
                        <div className={styles.passwordInputGroup}>
                            <label htmlFor="password">Enter your password to confirm:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Your account password"
                                className={styles.passwordInput}
                                disabled={loading}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && password) {
                                        verifyAndSubmit();
                                    }
                                }}
                            />
                        </div>
                        
                        {error && <div className={styles.modalError}>{error}</div>}

                        <div className={styles.passwordModalActions}>
                            <button 
                                className={styles.postButton}
                                onClick={verifyAndSubmit}
                                disabled={loading || !password}
                            >
                                {loading ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Posting...
                                    </>
                                ) : (
                                    "Post Attendance"
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PostAttendance;