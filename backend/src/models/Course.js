const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "pdf", "note", "quiz", "coding"],
      required: true,
    },
    filePath: String,
    content: String,
    duration: Number,
  },
  { timestamps: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: String,
    order: Number,
    lessons: [lessonSchema],
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },

    modules: [moduleSchema],

    isPublished: { type: Boolean, default: false },

    liveSessions: [
      {
        platform: { type: String, enum: ["zoom", "meet", "teams"] },
        link: String,
        scheduledAt: Date,
        durationMinutes: Number,
      },
    ],

    gamification: {
      enablePoints: { type: Boolean, default: true },
      completionPoints: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
