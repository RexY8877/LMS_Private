const express = require("express");
const { Exam, Submission } = require("../models/Exam");
const { protect, trainerOnly } = require("../middleware/authMiddleware");
const { gradeSubjectiveQuestion } = require("../services/aiGrader");

const router = express.Router();

// Create exam
router.post("/", protect, trainerOnly, async (req, res) => {
  try {
    const { courseId, title, questions, durationMinutes } = req.body;
    const exam = await Exam.create({
      course: courseId,
      title,
      questions,
      durationMinutes,
    });
    res.json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get exam for student (hide correct answers)
router.get("/:id", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const safeExam = {
      _id: exam._id,
      title: exam.title,
      course: exam.course,
      durationMinutes: exam.durationMinutes,
      questions: exam.questions.map((q) => ({
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        maxMarks: q.maxMarks,
      })),
    };

    res.json(safeExam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Submit exam answers (AI + objective grading)
router.post("/:id/submit", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const { answers } = req.body; // array
    if (!Array.isArray(answers) || answers.length !== exam.questions.length) {
      return res.status(400).json({ message: "Invalid answers payload" });
    }

    // 1. Objective scoring (MCQ)
    let objectiveScore = 0;
    exam.questions.forEach((q, idx) => {
      if (q.type === "mcq" && typeof answers[idx] === "number") {
        if (answers[idx] === q.correctIndex) {
          objectiveScore += q.maxMarks || 1;
        }
      }
    });

    // 2. AI grading for subjective
    const aiScores = [];
    const aiFeedback = [];
    let totalAIScore = 0;

    for (let i = 0; i < exam.questions.length; i++) {
      const q = exam.questions[i];

      if (q.type === "mcq") {
        aiScores.push(null);
        aiFeedback.push("");
        continue;
      }

      const answer = answers[i] || "";
      if (!answer.trim()) {
        aiScores.push(0);
        aiFeedback.push("No answer given.");
        continue;
      }

      const result = await gradeSubjectiveQuestion({
        questionText: q.questionText,
        rubric: q.rubric,
        answer,
        maxMarks: q.maxMarks || 5,
      });

      aiScores.push(result.score);
      aiFeedback.push(result.feedback);
      totalAIScore += result.score;
    }

    const gradedBy = totalAIScore > 0 ? "rules+ai" : "rules";
    const totalScore = objectiveScore + totalAIScore;

    const submission = await Submission.create({
      exam: exam._id,
      student: req.user._id,
      answers,
      objectiveScore,
      aiScores,
      totalAIScore,
      aiFeedback,
      gradedBy,
      overallComment: `Total: ${totalScore}`,
    });

    res.json({
      submissionId: submission._id,
      objectiveScore,
      totalAIScore,
      totalScore,
      aiFeedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
