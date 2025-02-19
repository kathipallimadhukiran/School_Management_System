import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Admission from "./components/Admissions/Admission";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Feepayments from "./components/Feepayments/Feepayments";
import Dummypayments from "./components/Feepayments/dummyfee";
import Receipt from "./components/Feepayments/Receipt";
import Students from "./components/Dashboard/students";
import Teacher from "./components/Dashboard/Teachers";
import Login from "./components/Logins/Login";
import ProtectedRoute from "./components/Logins/ProtectedRoute";
import "./App.css";
import ResetPassword from "./components/Logins/ResetPassword";
import AdminDashboard from "./components/admindashboard/admindahboard";
import AddStaff from "./components/admindashboard/addStaff";

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const location = useLocation(); // Get the current route
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Track screen size

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
    setSidebarWidth(sidebarWidth === 250 ? 70 : 250);
  };

  // Check if user is on Reset Password or Login page
  const isAuthPage = location.pathname === "/Login" || location.pathname === "/reset-password";

  return (
    <div className="main_app">
      {isAuthPage ? (
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      ) : (
        <>
          <div className="nav-container">
            <Navbar />
          </div>
          <div className="main_container">
            <Sidebar width={sidebarWidth} isMobile={isMobile} toggleSidebar={toggleSidebar} />
            <div className="content_area">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/Teachers" element={<ProtectedRoute><Teacher /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                <Route path="/admissions" element={<ProtectedRoute><Admission /></ProtectedRoute>} />
                <Route path="/Feepayments" element={<ProtectedRoute><Feepayments /></ProtectedRoute>} />
                <Route path="/feePayments/payments" element={<ProtectedRoute><Dummypayments /></ProtectedRoute>} />
                <Route path="/feePayments/payments/Receipt" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />

                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                <Route path="/AdminDashboard/AddStaff" element={<AddStaff />} />
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
