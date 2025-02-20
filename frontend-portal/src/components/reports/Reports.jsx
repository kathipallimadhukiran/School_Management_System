import React, { useState, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import "./Reports.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Statistics = () => {
  const [data, setData] = useState([]);
  const [totalFees, setTotalFee] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://school-site-2e0d.onrender.com/gettingStudent");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json(); // Directly parse JSON response

        if (!result || !result.data) {
          throw new Error("Empty data from server");
        }

        // Set the fetched data
        setData(result.data);

        // Calculate totals for fees, paid, and due
        let fees = 0;
        let paid = 0;
        let due = 0;

        result.data.forEach((student) => {
          // console.log(student.Total_fee);


          // Safely add fees, paid, and due (check if the values exist)
          fees += student.Total_fee || 0;
          paid += student.Total_Fee_Paid || 0;
          due = (fees-paid)|| 0;
        });

        // Set the totals after the loop
        setTotalFee(fees);
        setTotalPaid(paid);
        setTotalDue(due);


      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) return <p>Loading statistics...</p>;

  // Data for the Doughnut Chart (Paid vs. Due Fees)
  const feeData = {
    labels: ["Paid Fees", "Due Fees"],
    datasets: [
      {
        data: [totalPaid,totalDue], // Corrected to use totalPaid and totalDue
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };


  const options = {
    rotation: -90, // Start from the top
    circumference: 180, // Half circle (180 degrees)
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="statistics-container">
      <div className="title"><h2>Fee Payment Statistics</h2></div>

      <div className="stats-grid">
        {/* Student Count */}
        <div className="stat-box">
          <h3>Total Students</h3>
          <div className="meter">
            <span style={{ width: `${(data.length / 50) * 100}%` }}></span>
          </div>
          <p>{data.length} / {50}</p>
        </div>

        {/* Teacher Count */}
        <div className="stat-box">
          <h3>Total Teachers</h3>
          <div className="meter">
            <span style={{ width: `${(50 / 100) * 100}%` }}></span>
          </div>
          <p>{50} /10</p>
        </div>
      </div>

      <div className="chart-container">
       
        <div className="semi-circle">
          {/* Fee Due vs. Paid Doughnut Chart */}
          <Doughnut data={feeData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
