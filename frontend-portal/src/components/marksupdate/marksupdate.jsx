import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MarksUpdate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    alert("Naku inka samayam prapthinchaledhu bayya");
    navigate(-1); // Navigate back to the previous page
  }, [navigate]);

  return <div></div>; // Empty div since we don't need to render anything
};

export default MarksUpdate;