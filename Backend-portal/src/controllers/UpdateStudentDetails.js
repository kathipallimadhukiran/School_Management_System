var express = require('express');
var Student = require('../models/studentdata');

const UpdateStudentDetails = async (req, res) => {
    try {
        const {
            id,
            Student_name,
            Student_age,
            Grade_applying_for,
            Address,
            City,
            State,
            District,
            ZIP_code,
            Emergency_contact_number,
            Student_father_number,
            Student_mother_number,
            Number_of_terms,
            fees
        } = req.body;

        console.log(
            id,
            Student_name,
            Student_age,
            Grade_applying_for,
            Address,
            City,
            State,
            District,
            ZIP_code,
            Emergency_contact_number,
            Student_father_number,
            Student_mother_number,
            Number_of_terms,
            fees
        );

        // Find student by ID
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Update student details
        const fieldsToUpdate = {
            Student_name,
            Student_age,
            Grade_applying_for,
            Address,
            City,
            State,
            District,
            ZIP_code,
            Emergency_contact_number,
            Student_father_number,
            Student_mother_number,
            Number_of_terms,
        };

        // Only update fields that are provided
        Object.keys(fieldsToUpdate).forEach(key => {
            if (fieldsToUpdate[key] !== undefined) {
                student[key] = fieldsToUpdate[key];
            }
        });

        // Update fees if provided
        if (Array.isArray(fees)) {
            student.fees = fees;
        }

        await student.save();
        res.json({ message: "Student updated successfully", student });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const AddFee = async (req, res) => {
    try {
        const { id, FeeType, FeeAmount, FeePaid } = req.body;

        if (!id || !FeeType || FeeAmount === undefined || FeePaid === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const parsedFeeAmount = Number(FeeAmount);
        const parsedFeePaid = Number(FeePaid);

        if (isNaN(parsedFeeAmount) || isNaN(parsedFeePaid)) {
            return res.status(400).json({ message: "FeeAmount and FeePaid must be numbers" });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Ensure `fees` is always an array
        if (!Array.isArray(student.fees)) {
            student.fees = [];
        }

        // Create new fee entry
        const newFee = {
            FeeType,
            FeeAmount: parsedFeeAmount,
            FeePaid: parsedFeePaid,
            Date: new Date(),
        };

        student.fees.push(newFee);
        student.Total_Fee_Paid = (Number(student.Total_Fee_Paid) || 0) + parsedFeePaid;

        await student.save();
        return res.status(200).json({ message: "Fee added successfully", student });
    } catch (error) {
        console.error("Error adding fee:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

const DeleteStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;

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
exports.AddFee = AddFee;
exports.DeleteStudentDetails = DeleteStudentDetails;
