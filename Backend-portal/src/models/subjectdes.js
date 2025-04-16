const subjectSchema = new mongoose.Schema({
    name: String,
    divisions: [{
      name: String,
      maxMarks: Number
    }]
  });
  
  // Add a virtual property to calculate total max marks
  subjectSchema.virtual('totalMaxMarks').get(function() {
    return this.divisions.reduce((total, division) => {
      return total + (division.maxMarks || 0);
    }, 0);
  });
  
  // Enable virtuals to be included in JSON output
  subjectSchema.set('toJSON', { virtuals: true });
  subjectSchema.set('toObject', { virtuals: true });
  
  const Subject = mongoose.model('Subject', subjectSchema);
