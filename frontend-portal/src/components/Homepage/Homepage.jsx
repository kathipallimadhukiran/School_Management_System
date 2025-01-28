import React from 'react';
import { Outlet } from 'react-router-dom'; // Import from react-router-dom
import "./Homepage.css";
import Navbar from "../Navbar/Navbar";
import Dashboard from '../Dashboard/Dashboard';
import Sidebar from '../sidebar/Sidebar';

const Homepage = () => {
  return (
    <div>
      <Navbar />
      <div className='main_container'>
        <Sidebar />
        <div className='content_area'>
          
        </div>
      </div>
    </div>
  );
};