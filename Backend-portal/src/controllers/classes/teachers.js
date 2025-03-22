const express = require('express');
var Teacher = require("../../models/teacherdata");


const getAllTeachers = async (req, res) => {
  try {
    const totalClasses = await Teacher.find();
    res.json(totalClasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllTeachers= getAllTeachers