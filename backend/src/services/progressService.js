const User = require("../models/User");
const Course = require("../models/Course");

const awardProgress = async (userId, courseId, lessonId, activityType) => {
  const user = await User.findById(userId);
  
  // 1. Logic for Course Completion Percentage
  if (courseId && lessonId) {
    const progressEntry = user.courseProgress.find(p => p.course.toString() === courseId);
    if (progressEntry && !progressEntry.completedLessons.includes(lessonId)) {
      progressEntry.completedLessons.push(lessonId);
    } else if (!progressEntry) {
      user.courseProgress.push({ course: courseId, completedLessons: [lessonId] });
    }
  }

  // 2. Points Logic (Requirement 4.C)
  const pointsMap = {
    lesson_complete: 10,
    coding_success: 30,
    exam_pass: 50,
    perfect_attendance: 20
  };

  const pointsToAdd = pointsMap[activityType] || 5;
  user.points += pointsToAdd;

  // 3. Badge Logic (Requirement 4.C)
  // Automate badge awarding based on milestones
  if (user.points >= 100 && !user.badges.includes("Fast Learner")) {
    user.badges.push("Fast Learner");
  }
  if (user.points >= 500 && !user.badges.includes("Ace Coder")) {
    user.badges.push("Ace Coder");
  }

  await user.save();
  return { points: user.points, badges: user.badges };
};

module.exports = { awardProgress };