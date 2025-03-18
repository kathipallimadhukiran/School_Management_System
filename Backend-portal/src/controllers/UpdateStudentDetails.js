var express = require('express');
var Student = require('../models/studentdata');
const Class = require('../models/classes'); // Class Model
const UpdateStudentDetails = async (req, res) => {
    console.log("Received Update Request:", req.body); // Debugging

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
        const existingStudent = await Student.findById(id);
        if (!existingStudent) {
            return res.status(404).json({ message: "Student not found." });
        }

        // 🏫 Find Class based on "Grade_applying_for"
        const matchedClass = await Class.findOne({ name: Grade_applying_for });

        // Update student details
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            {
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
                classId: matchedClass ? matchedClass._id : null, // Assign class if found
            },
            { new: true }
        );

        // If the student has been assigned to a class, update the class's student list
        if (matchedClass) {
            // Remove the student from any previously assigned class
            await Class.updateMany(
                { students: id },
                { $pull: { students: id } }
            );

            // Add student to the matched class
            if (!matchedClass.students.includes(id)) {
                matchedClass.students.push(id);
                await matchedClass.save();
            }
        }

        res.status(200).json({
            message: "Student details updated successfully",
            student: updatedStudent,
            classAssigned: matchedClass ? matchedClass.name : "No class assigned",
        });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "An error occurred while updating student details." });
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
