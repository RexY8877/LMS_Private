const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const codingQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    languages: [{ type: String }], // ["c", "cpp", "java", "python", "sql"]
    topics: [String],
    companyTags: [String], // TCS NQT, Infosys, etc.
    testCases: [testCaseSchema],

    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 256 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingQuestion", codingQuestionSchema);
