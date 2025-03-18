import { Routes, Route } from "react-router-dom";
import ClassDashboard from "./classDashboard"; 
import ProtectedRoute from "../../Logins/ProtectedRoute";
import CreateClass from "./createclasses/createclasses";
import Manageclass from "./createclasses/manageclass";

const ClassApp = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<ProtectedRoute><ClassDashboard /></ProtectedRoute>} />

      {/* Create Class Route (Ensure Full Path) */}
      <Route path="createclass" element={<ProtectedRoute><CreateClass /></ProtectedRoute>} />
      <Route path="manageclass" element={<ProtectedRoute><Manageclass /></ProtectedRoute>} />
    </Routes>
  );
};

export default ClassApp;
