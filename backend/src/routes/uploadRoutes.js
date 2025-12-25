const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, trainerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo ? 'uploads/videos' : 'uploads/pdfs';
    cb(null, path.join(__dirname, '..', folder));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/pdf', protect, trainerOnly, upload.single('file'), (req, res) => {
  res.json({ filePath: `/uploads/pdfs/${req.file.filename}` });
});

router.post('/video', protect, trainerOnly, upload.single('file'), (req, res) => {
  res.json({ filePath: `/uploads/videos/${req.file.filename}` });
});

module.exports = router;
