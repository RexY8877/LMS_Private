const express = require("express");
const User = require("../models/User");
const CodingSubmission = require("../models/CodingSubmission");
const SoftSkillAssessment = require("../models/SoftSkillAssessment");
const BehaviorAssessment = require("../models/BehaviorAssessment");
const { Exam, Submission } = require("../models/Exam");
const { protect, trainerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Student 360° profile
router.get("/student/:id", protect, async (req, res) => {
  const studentId = req.params.id === "me" ? req.user._id : req.params.id;

  const student = await User.findById(studentId).select("-password").populate("college");
  if (!student) return res.status(404).json({ message: "Student not found" });

  const codingSubs = await CodingSubmission.find({ student: studentId });
  const soft = await SoftSkillAssessment.find({ student: studentId });
  const behavior = await BehaviorAssessment.find({ student: studentId });
  const submissions = await Submission.find({ student: studentId }).populate("exam");

  // simple aggregates (you can refine later)
  const codingScore =
    codingSubs.length === 0
      ? 0
      : (codingSubs.reduce((s, sub) => s + sub.passedCount / sub.totalCount, 0) /
          codingSubs.length) *
        100;

  const writing = soft.filter((s) => s.type === "writing");
  const avgWritingGrammar =
    writing.length === 0
      ? 0
      : writing.reduce((s, w) => s + (w.scores.grammar || 0), 0) / writing.length;

  // similarly you can compute reading/speaking aggregates

  res.json({
    student,
    coding: {
      codingScore,
      submissionsCount: codingSubs.length,
    },
    softSkills: {
      writingSamples: writing.length,
      avgGrammar: avgWritingGrammar,
    },
    behavior,
    exams: submissions.map((s) => ({
      examId: s.exam._id,
      examTitle: s.exam.title,
      objectiveScore: s.objectiveScore,
      totalAIScore: s.totalAIScore,
      createdAt: s.createdAt,
    })),
  });
});

// College-level dashboard
router.get("/college/:collegeId", protect, trainerOnly, async (req, res) => {
  const collegeId = req.params.collegeId;
  const students = await User.find({ college: collegeId, role: "student" });

  const studentIds = students.map((s) => s._id);
  const codingSubs = await CodingSubmission.find({
    student: { $in: studentIds },
  });
  const submissions = await Submission.find({
    student: { $in: studentIds },
  });

  // extremely simple placement readiness index example
  const readiness =
    submissions.length === 0
      ? 0
      : submissions.reduce((s, sub) => s + (sub.objectiveScore || 0), 0) /
        submissions.length;

  res.json({
    studentCount: students.length,
    codingSubmissions: codingSubs.length,
    assessmentSubmissions: submissions.length,
    placementReadinessIndex: readiness,
  });
});

module.exports = router;
