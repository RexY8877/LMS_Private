const User = require("../models/User");
const SoftSkill = require("../models/SoftSkillAssessment");

async function calculateEmployability(userId) {
  const user = await User.findById(userId);
  const assessments = await SoftSkill.find({ user: userId });

  // Group assessments by type
  const scores = assessments.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || []).concat(curr.score);
    return acc;
  }, {});

  const avg = (arr) => arr ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const report = {
    technicalConsistency: user.points > 500 ? "High" : "Developing",
    communicationScore: avg(scores.speaking),
    professionalWriting: avg(scores.writing),
    readingComprehension: avg(scores.reading)
  };

  // AI Logic to determine "Fit"
  let fit = "Junior Developer";
  if (report.communicationScore > 8 && report.technicalConsistency === "High") {
    fit = "Lead Engineer / Consultant";
  } else if (report.communicationScore > 8) {
    fit = "Product/Project Management";
  }

  return { ...report, suggestedCareerPath: fit };
}