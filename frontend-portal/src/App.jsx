import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admission from "./components/Admissions/Admission"; // Make sure you import the Admission component
import Navbar from "./components/Navbar/Navbar"; // Make sure you import the Navbar component
import Sidebar from "./components/sidebar/Sidebar"; // Make sure you import the Sidebar component
import "./App.css";
import { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import Feepayments from "./components/Feepayments/Feepayments";
import Dummypayments from "./components/Feepayments/dummyfee";
import Receipt from "./components/Feepayments/Receipt";

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(250);

  const toggleSidebar = () => {
    setSidebarWidth(sidebarWidth === 250 ? 70 : 250); // Toggle between 250px and 70px
  };

  return (
    <Router>
      <div className="main_app" >
        <div className="nav-container">
        <Navbar />
        </div>
        <div className="main_container">
          <Sidebar style={{ width: `${sidebarWidth}px` }} />
          <div className="content_area">
          <div className="content_area_dup">
            <Routes>
              <Route path="/" element={<Dashboard/>} index />
              <Route path="/Dashboard" element={<Dashboard />} index />
              <Route path="/admissions" element={<Admission />} />
              <Route path="/Feepayments" element={<Feepayments />} />
              <Route path="/feePayments/payments" element={<Dummypayments />} />
              <Route path="/feePayments/payments/Receipt" element={<Receipt/>} />
            </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
