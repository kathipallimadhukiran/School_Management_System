const express = require("express");
const mongoose = require("mongoose");
const classes = require("../../models/classes"); // Import the Class model

const Add_Student_Class = async (req, res) => {
  try {
    const { class_name, class_teacher, class_students, class_subjects, subject_marks } = req.body;

    // Check if required fields are provided
    if (!class_name || !class_teacher || !class_students || !class_subjects || !subject_marks) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new class document
    const newClass = new classes.Class({
      class_name,
      class_teacher,
      class_students,
      class_subjects,
      subject_marks
    });

    // Save to the database
    await newClass.save();

    res.status(201).json({ message: "Class added successfully!", class: newClass });

  } catch (error) {
    console.error("Error adding class:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const Get_classes = async (req, res) => {
  try {
    const allClasses = await classes.find();
    res.json(allClasses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching classes" });
  }
};

module.exports = { Add_Student_Class, Get_classes };