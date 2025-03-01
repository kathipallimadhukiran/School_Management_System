var express = require('express');
var Student = require('../models/studentdata');

const UpdateStudentDetails = async (req, res) => {
    try {
        const id = req.body.id;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Update student details here
        // ...

        res.json({ message: "Student updated successfully" });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const DeleteStudentDetails = async (req, res) => {
    try {
        const id = req.params.id;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await Student.findByIdAndDelete(id);

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.UpdateStudentDetails = UpdateStudentDetails;
exports.DeleteStudentDetails = DeleteStudentDetails;