const express = require("express");
const Student = require("../models/student");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

const getUserId = (req) => req.user._id.toString();

router.get("/", async (req, res) => {
  try {
    const students = await Student.find({ userId: getUserId(req) }).sort({
      createdAt: -1,
    });
    return res.json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json(student);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { fullName, studentId, email, grade, enrollmentDate } = req.body;
    if (!fullName || !studentId || !email) {
      return res
        .status(400)
        .json({ message: "fullName, studentId and email are required" });
    }
    const student = await Student.create({
      userId: getUserId(req),
      fullName,
      studentId,
      email,
      grade: grade || "",
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
    });
    return res.status(201).json(student);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { fullName, studentId, email, grade, enrollmentDate } = req.body;
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, userId: getUserId(req) },
      {
        ...(fullName != null && { fullName }),
        ...(studentId != null && { studentId }),
        ...(email != null && { email }),
        ...(grade != null && { grade }),
        ...(enrollmentDate != null && {
          enrollmentDate: new Date(enrollmentDate),
        }),
      },
      { new: true, runValidators: true },
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json(student);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      _id: req.params.id,
      userId: getUserId(req),
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json({ message: "Student deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
