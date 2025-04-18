// Create a migration file (e.g., migrations/addSectionToStudents.js)
const mongoose = require('mongoose');
const User = require('../models/studentdata'); // Adjust path as needed
const Section = require('../models/S'); // You'll need your Section model

async function migrate() {
  await mongoose.connect('your-mongodb-uri');
  
  // Get default section (you may need to adjust this)
  const defaultSection = await Section.findOne();
  if (!defaultSection) {
    throw new Error('No sections exist in database');
  }

  // Update all students
  const result = await User.updateMany(
    { sectionId: { $exists: false } },
    { $set: { sectionId: defaultSection._id } }
  );

  console.log(`Updated ${result.nModified} students with sectionId`);
  process.exit(0);
}

migrate().catch(console.error);