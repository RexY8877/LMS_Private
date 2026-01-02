const express = require("express");
const SoftSkillAssessment = require("../models/SoftSkillAssessment");
const { protect } = require("../middleware/authMiddleware");
const { analyzeWriting } = require("../services/aiSoftSkills");

const router = express.Router();

// Writing assessment
router.post("/writing", protect, async (req, res) => {
  try {
    const { prompt, inputText } = req.body;
    const analysis = await analyzeWriting(inputText);

    const assessment = await SoftSkillAssessment.create({
      student: req.user._id,
      type: "writing",
      prompt,
      inputText,
      scores: {
        grammar: analysis.grammar,
        coherence: analysis.coherence,
        structure: analysis.structure,
        vocabulary: analysis.vocabulary,
        tone: analysis.tone,
      },
      aiFeedback: analysis.feedback,
    });

    res.json(assessment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// TODO: reading, speaking endpoints (once STT and reading test UI are ready)

module.exports = router;
