const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // roles per requirements
    role: {
      type: String,
      enum: ["student", "trainer", "faculty", "collegeAdmin", "superAdmin"],
      default: "student",
    },

    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    batch: String, // e.g. "2025", "CSE-A"

    // for gamification
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
  },
  { timestamps: true }
);

// compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
