import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./Reports.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatBox = ({ title, value, maxValue }) => {
  const percentage = maxValue ? (value / maxValue) * 100 : 0;
  return (
    <div className="stat-box">
      <h3>{title}</h3>
      <div className="meter">
        <span style={{ width: `${percentage}%` }}></span>
      </div>
      <p>
        {value} / {maxValue}
      </p>
    </div>
  );
};

const Statistics = () => {
  const [totalFees, setTotalFee] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://school-site-2e0d.onrender.com/gettingStudent");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        if (!result || !result.data) throw new Error("Empty data from server");

        let fees = 0, paid = 0;
        result.data.forEach((student) => {
          fees += student.Total_fee || 0;
          paid += student.Total_Fee_Paid || 0;
        });

        setTotalFee(fees);
        setTotalPaid(paid);
        setTotalDue(fees - paid);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchData();
  }, []);

  const feeData = {
    labels: ["Paid Fees", "Due Fees"],
    datasets: [
      {
        data: [totalPaid, totalDue],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    rotation: -90,
    circumference: 180,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="statistics-container">
      <h2 className="title">Fee Payment Statistics</h2>
      <div className="content">
        <div className="chart-container">
          <Doughnut data={feeData} options={options} />
        </div>
        <div className="stats-boxes">
          <StatBox title="Paid Fees" value={totalPaid} maxValue={totalFees} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
