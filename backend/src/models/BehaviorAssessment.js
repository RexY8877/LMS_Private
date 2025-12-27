const mongoose = require("mongoose");

const behaviorAssessmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scenarioType: {
      type: String,
      enum: [
        "selfIntro",
        "groupDiscussion",
        "businessEmail",
        "clientCommunication",
        "interview",
        "workplaceBehavior",
      ],
    },
    inputText: String,
    audioFilePath: String,

    scores: {
      professionalism: Number,
      clarity: Number,
      empathy: Number,
      attitude: Number,
      readiness: Number,
    },

    aiSummary: String,
    gapAreas: [String],
    suggestedPath: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BehaviorAssessment", behaviorAssessmentSchema);
