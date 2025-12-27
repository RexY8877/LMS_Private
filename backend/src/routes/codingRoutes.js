const express = require("express");
const CodingQuestion = require("../models/CodingQuestion");
const CodingSubmission = require("../models/CodingSubmission");
const { protect, trainerOnly } = require("../middleware/authMiddleware");
const { runCodeAgainstTests } = require("../services/codeJudge");

const router = express.Router();

// Create coding question (trainer / faculty)
router.post("/questions", protect, trainerOnly, async (req, res) => {
  try {
    const question = await CodingQuestion.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// List with filters
router.get("/questions", protect, async (req, res) => {
  const { difficulty, topic } = req.query;
  const filter = {};
  if (difficulty) filter.difficulty = difficulty;
  if (topic) filter.topics = topic;

  const questions = await CodingQuestion.find(filter);
  res.json(questions);
});

// Single question
router.get("/questions/:id", protect, async (req, res) => {
  const q = await CodingQuestion.findById(req.params.id);
  if (!q) return res.status(404).json({ message: "Question not found" });
  res.json(q);
});

// Submit code
router.post("/questions/:id/submit", protect, async (req, res) => {
  try {
    const question = await CodingQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const { language, code } = req.body;

    // call judge
    const judgeResult = await runCodeAgainstTests({
      language,
      code,
      testCases: question.testCases,
    });

    const submission = await CodingSubmission.create({
      student: req.user._id,
      question: question._id,
      language,
      code,
      passedCount: judgeResult.passedCount,
      totalCount: judgeResult.totalCount,
      timeMs: judgeResult.timeMs,
      memoryMb: judgeResult.memoryMb,
      status:
        judgeResult.passedCount === judgeResult.totalCount ? "passed" : "failed",
      plagiarismScore: judgeResult.plagiarismScore,
      complexityScore: judgeResult.complexityScore,
      report: judgeResult.results,
    });

    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
