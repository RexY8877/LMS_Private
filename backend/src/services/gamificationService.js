// backend/src/services/gamificationService.js
const User = require("../models/User");

const awardPoints = async (userId, activityType) => {
  const pointsMap = {
    lesson_complete: 10,
    exam_pass: 50,
    coding_correct: 30,
    perfect_score: 100
  };

  const pointsToAdd = pointsMap[activityType] || 5;
  
  const user = await User.findById(userId);
  user.points += pointsToAdd;

  // Logic for Badges (Requirement 4.C)
  if (user.points > 500 && !user.badges.includes("Ace Coder")) {
    user.badges.push("Ace Coder");
  }

  await user.save();
  return { points: user.points, badges: user.badges };
};

module.exports = { awardPoints };