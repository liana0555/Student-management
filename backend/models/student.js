const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    grade: { type: String, trim: true },
    enrollmentDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
