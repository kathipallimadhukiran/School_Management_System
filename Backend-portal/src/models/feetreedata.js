const feeTreeSchema = new mongoose.Schema({
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    Registration_number: { 
      type: String, 
      required: false  // Make sure this is not set to true unless necessary
    },
    Types: [{
      FeeType: { 
        type: String, 
        required: true 
      },
      TotalFee: { 
        type: Number, 
        required: true 
      },
      TypeTotalPaid: { 
        type: String, 
        required: true 
      },
      paymentDate: { 
        type: Date, 
        default: Date.now 
      }
    }],
  });
  