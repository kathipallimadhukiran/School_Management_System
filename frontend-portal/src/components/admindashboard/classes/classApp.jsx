import { Routes, Route } from "react-router-dom";
import ClassDashboard from "./classDashboard"; 
import ProtectedRoute from "../../Logins/ProtectedRoute";
import CreateClass from "./createclasses/createclasses";
import Manageclass from "./createclasses/manageclass";
import Addsubject from "./createclasses/Addsubject";
import ClassCards from "./createclasses/ClassCards";

const ClassApp = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<ProtectedRoute><ClassDashboard /></ProtectedRoute>} />

      {/* Create Class Route (Ensure Full Path) */}
      <Route path="createclass" element={<ProtectedRoute><CreateClass /></ProtectedRoute>} />
      <Route path="manageclass" element={<ProtectedRoute><Manageclass /></ProtectedRoute>} />
      <Route path="Addsubject" element={<ProtectedRoute><Addsubject /></ProtectedRoute>} />
      <Route path="classcards" element={<ProtectedRoute><ClassCards /></ProtectedRoute>} />

    </Routes>
  );
};

export default ClassApp;
