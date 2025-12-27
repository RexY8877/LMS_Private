const mongoose = require("mongoose");

const codingSubmissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingQuestion",
      required: true,
    },
    language: String,
    code: String,

    // judge results
    passedCount: Number,
    totalCount: Number,
    timeMs: Number,
    memoryMb: Number,
    status: { type: String, enum: ["pending", "running", "passed", "failed"], default: "pending" },

    // plagiarism & metrics
    plagiarismScore: Number, // 0–1
    complexityScore: Number,

    report: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingSubmission", codingSubmissionSchema);
