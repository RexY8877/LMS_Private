const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const College = require("../models/College");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "student", collegeCode } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    let college = null;
    if (collegeCode) {
      college = await College.findOne({ code: collegeCode });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      college: college?._id,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("college", "name code");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// helper middleware
const adminOnly = async (req, res, next) => {
  if (!req.user || !["collegeAdmin", "superAdmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

// BULK UPLOAD via CSV
router.post("/bulk-upload", protect, adminOnly, async (req, res) => {
  // expecting req.body.csvPath or later integrate with multer upload
  const { csvPath, collegeCode, defaultRole = "student" } = req.body;
  if (!csvPath) return res.status(400).json({ message: "csvPath required" });

  const absolutePath = path.resolve(csvPath);
  const college = await College.findOne({ code: collegeCode });

  const results = [];
  fs.createReadStream(absolutePath)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      try {
        for (const row of results) {
          const { name, email, password, role } = row;
          if (!email) continue;
          const exists = await User.findOne({ email });
          if (exists) continue;

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password || "Welcome@123", salt);

          await User.create({
            name: name || email,
            email,
            password: hashedPassword,
            role: role || defaultRole,
            college: college?._id,
          });
        }
        res.json({ message: "Bulk upload completed", count: results.length });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    });
});

module.exports = router;
