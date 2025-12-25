const express = require('express');
const Course = require('../models/Course');
const { protect, trainerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, trainerOnly, async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.create({
      title,
      description,
      trainer: req.user._id
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const courses = await Course.find().populate('trainer', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/lessons', protect, trainerOnly, async (req, res) => {
  try {
    const { title, type, filePath, content, duration } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.lessons.push({ title, type, filePath, content, duration });
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
