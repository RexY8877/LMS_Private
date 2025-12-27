const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true }, // internal short code
    city: String,
    state: String,
    country: String,

    // for college-level dashboards
    placementYear: Number,
    erpIntegrationId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("College", collegeSchema);
