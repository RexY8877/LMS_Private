const { calculateEmployability } = require("../services/behavioralEngine");

router.get('/placement-readiness', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const behavioralData = await calculateEmployability(userId);
    
    // Combine with gamification stats
    const report = {
      studentName: req.user.name,
      overallPoints: req.user.points,
      badges: req.user.badges,
      employability: behavioralData,
      status: behavioralData.communicationScore > 7 ? "Ready for Interview" : "Training Required"
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Error generating report" });
  }
});