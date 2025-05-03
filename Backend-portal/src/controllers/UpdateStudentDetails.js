var express = require('express');
var Student = require('../models/studentdata');
const {Class} = require('../models/classes'); // Class Model
const UpdateStudentDetails = async (req, res) => {
    console.log("Received Update Request:", req.body);

    const {
        id,
        Student_name,
        Grade_applying_for,
        Date_of_birth,
        Address,
        City,
        State,
        District,
        ZIP_code,
        Emergency_contact_number,
        Student_father_name,
        Student_father_number,
        Student_mother_name,
        Student_mother_number,
        Fathers_mail,
        Student_gender,
        Student_age,
        Number_of_terms,
        Total_fee
    } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Student ID is required for update." });
    }

    try {
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Find the new class by grade
        const newClass = await Class.findOne({ name: Grade_applying_for });

        // Update student fields
        const updateFields = {
            Student_name,
            Grade_applying_for,
            Date_of_birth,
            Address,
            City,
            State,
            District,
            ZIP_code,
            Emergency_contact_number,
            Student_father_name,
            Student_father_number,
            Student_mother_name,
            Student_mother_number,
            Fathers_mail,
            Student_gender,
            Student_age,
            Number_of_terms,
            Total_fee,
            classId: newClass ? newClass._id : null,
        };

        const updatedStudent = await Student.findByIdAndUpdate(id, updateFields, { new: true });

        // If a valid class is found, update class-student references
        if (newClass) {
            // Remove student from any class that previously contained them
            await Class.updateMany(
                { students: id },
                { $pull: { students: id } }
            );

            // Add to new class if not already present
            if (!newClass.students.includes(id)) {
                newClass.students.push(id);
                await newClass.save();
            }
        }

        return res.status(200).json({
            message: "Student details updated successfully.",
            student: updatedStudent,
            classAssigned: newClass ? newClass.name : "Not assigned to any class",
        });

    } catch (error) {
        console.error("Error updating student:", error);
        return res.status(500).json({
            message: "An error occurred while updating student details.",
            error: error.message
        });
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
