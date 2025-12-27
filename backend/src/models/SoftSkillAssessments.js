const mongoose = require("mongoose");

const softSkillAssessmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["writing", "reading", "speaking"], required: true },

    prompt: String,
    inputText: String,      // writing / STT result
    audioFilePath: String,  // raw audio if speaking

    scores: {
      grammar: Number,
      coherence: Number,
      structure: Number,
      vocabulary: Number,
      tone: Number,
      comprehension: Number,
      accuracy: Number,
      speed: Number,
      retention: Number,
      pronunciation: Number,
      fluency: Number,
      confidence: Number,
    },

    aiFeedback: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SoftSkillAssessment", softSkillAssessmentSchema);
