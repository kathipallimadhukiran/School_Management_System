import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Admission from "./components/Admissions/Admission";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Feepayments from "./components/Feepayments/Feepayments";
import Dummypayments from "./components/Feepayments/PaymentPage";
import Receipt from "./components/Feepayments/Receipt";
import Students from "./components/admindashboard/students";
import Teacher from "./components/admindashboard/Teachers";
import Login from "./components/Logins/Login";
import ProtectedRoute from "./components/Logins/ProtectedRoute";
import styles from "./App.module.css"; // Import CSS Module
import ResetPassword from "./components/Logins/ResetPassword";
import AdminDashboard from "./components/admindashboard/admindahboard";
import AddStaff from "./components/admindashboard/addStaff";
import StudentManagement from "./components/updatestudent/StudentManagement";
import ClassApp from "./components/admindashboard/classes/classApp";
import TeachersList from "./components/admindashboard/TeachersList";
import ClassList from "./components/admindashboard/classlist";
import MarksManagement from "./components/marksmanagement/MarksManagement";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StaffProfile from "./components/Dashboard/StaffProfile";


function App() {

    const [userRole, setUserRole] = useState(null);
  
    useEffect(() => {
      const storedUserRole = localStorage.getItem("userRole");
      setUserRole(storedUserRole);
    }, []);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const location = useLocation(); // Get the current route
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Track screen size
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const hideBackButtonPaths = ["/Dashboard", "/AdminDashboard"];
  const shouldHideBackButton = hideBackButtonPaths.includes(location.pathname);



  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarWidth(window.innerWidth <= 768 ? 70 : 250); // Auto-collapse on small screens
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen); // Toggle mobile menu visibility
    } else {
      setSidebarWidth(sidebarWidth === 250 ? 70 : 250); // Toggle sidebar width for desktop
    }
  };

  // Check if user is on Reset Password or Login page
  const isAuthPage = location.pathname === "/Login" || location.pathname === "/reset-password";

  return (
    <div className={styles.mainApp}>
<ToastContainer />
      {isAuthPage ? (
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      ) : (
        <>
          <div className={styles.navContainer}>
            <Navbar toggleSidebar={toggleSidebar} />
          </div>
          <div className={styles.mainContainer}>
            {!isMobile && (
              <Sidebar width={sidebarWidth} isMobile={isMobile} toggleSidebar={toggleSidebar} />
            )}

            {/* Render Mobile Menu */}
            {isMobile && isMobileMenuOpen && (
              <div className={styles.mobileMenu}>
                <Sidebar width={250} isMobile={isMobile} toggleSidebar={toggleSidebar} />
              </div>
            )}

            {/* Overlay for mobile menu */}
            {isMobile && isMobileMenuOpen && (
              <div className={styles.overlay} onClick={toggleSidebar}></div>
            )}


           

            <div className={styles.contentArea}>
            {!shouldHideBackButton && (
             
                <button className={styles.backButton} onClick={() => navigate(-1)}> ← Back</button>
             
            )}
              <Routes>
                {userRole=="Admin"?<Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />:<Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                }
                <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/StaffProfile" element={<ProtectedRoute><StaffProfile/></ProtectedRoute>} />
                <Route path="/Teachers" element={<ProtectedRoute><Teacher /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                <Route path="/StudentManagement" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
                <Route path="/admissions" element={<ProtectedRoute><Admission /></ProtectedRoute>} />
                <Route path="/Feepayments" element={<ProtectedRoute><Feepayments /></ProtectedRoute>} />
                <Route path="/feePayments/payments" element={<ProtectedRoute><Dummypayments /></ProtectedRoute>} />
                <Route path="/feePayments/payments/Receipt" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
                <Route path="/MarksManagement" element={<ProtectedRoute><MarksManagement/></ProtectedRoute>} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                <Route path="/AdminDashboard/AddStaff" element={<AddStaff />} />
                <Route path="/AdminDashboard/TeachersList" element={<TeachersList />} />
                <Route path="/AdminDashboard/ClassList" element={<ClassList/>} />
                <Route path="/AdminDashboard/ClassManagement/*" element={<ClassApp />} />

              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;