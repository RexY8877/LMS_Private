const express = require('express');
const Course = require('../models/Course');
const { Exam, Submission } = require('../models/Exam');
const User = require('../models/User');
const { protect, trainerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/trainer/me', protect, trainerOnly, async (req, res) => {
  try {
    const trainerId = req.user._id;
    const courses = await Course.find({ trainer: trainerId });
    const courseIds = courses.map((c) => c._id);
    const exams = await Exam.find({ course: { $in: courseIds } });
    const examIds = exams.map((e) => e._id);
    const submissions = await Submission.find({ exam: { $in: examIds } });

    const studentSet = new Set(submissions.map((s) => s.student.toString()));
    const totalStudents = studentSet.size;
    const totalSubmissions = submissions.length;
    const avgScore =
      totalSubmissions === 0
        ? 0
        : submissions.reduce((sum, s) => sum + (s.objectiveScore || 0), 0) /
          totalSubmissions;

    res.json({
      coursesCount: courses.length,
      examsCount: exams.length,
      totalStudents,
      totalSubmissions,
      avgScore
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/public/trainer/:trainerId', async (req, res) => {
  try {
    const trainerId = req.params.trainerId;
    const trainer = await User.findById(trainerId).select('name');
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    const courses = await Course.find({ trainer: trainerId });
    const courseIds = courses.map((c) => c._id);
    const exams = await Exam.find({ course: { $in: courseIds } });
    const examIds = exams.map((e) => e._id);
    const submissions = await Submission.find({ exam: { $in: examIds } });

    const studentSet = new Set(submissions.map((s) => s.student.toString()));
    const totalStudents = studentSet.size;
    const totalSubmissions = submissions.length;
    const avgScore =
      totalSubmissions === 0
        ? 0
        : submissions.reduce((sum, s) => sum + (s.objectiveScore || 0), 0) /
          totalSubmissions;

    res.json({
      trainer: {
        id: trainer._id,
        name: trainer.name
      },
      metrics: {
        coursesCount: courses.length,
        examsCount: exams.length,
        totalStudents,
        totalSubmissions,
        avgScore
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
