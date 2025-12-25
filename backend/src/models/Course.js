const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'pdf', 'note'], required: true },
    filePath: String,
    content: String,
    duration: Number
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessons: [lessonSchema],
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
