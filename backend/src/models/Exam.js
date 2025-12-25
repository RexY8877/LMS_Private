const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'short', 'long'], default: 'mcq' },
    options: [String],
    correctIndex: Number,
    maxMarks: { type: Number, default: 1 },
    rubric: String
  },
  { _id: false }
);

const examSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    questions: [questionSchema],
    durationMinutes: { type: Number, default: 30 }
  },
  { timestamps: true }
);

const submissionSchema = new Schema(
  {
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [Schema.Types.Mixed],
    objectiveScore: { type: Number, default: 0 },
    aiScores: [Number],
    totalAIScore: { type: Number, default: 0 },
    aiFeedback: [String],
    overallComment: String,
    gradedBy: {
      type: String,
      enum: ['rules', 'ai', 'rules+ai'],
      default: 'rules'
    }
  },
  { timestamps: true }
);

const Exam = mongoose.model('Exam', examSchema);
const Submission = mongoose.model('Submission', submissionSchema);

module.exports = { Exam, Submission };
