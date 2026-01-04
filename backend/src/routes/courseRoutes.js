const { createZoomMeeting } = require('../services/zoomService');

// POST /api/courses/:id/live-session
router.post('/:id/live-session', protect, trainerOnly, async (req, res) => {
  try {
    const { title, scheduledAt, durationMinutes } = req.body;
    const course = await Course.findById(req.params.id);

    // 1. Call Zoom API
    const zoomData = await createZoomMeeting({
      topic: `${course.title}: ${title}`,
      startTime: scheduledAt,
      duration: durationMinutes
    });

    // 2. Save to Database
    course.liveSessions.push({
      platform: "zoom",
      meetingId: zoomData.meetingId,
      passcode: zoomData.passcode,
      link: zoomData.link,
      scheduledAt,
      durationMinutes
    });

    await course.save();
    res.json(course.liveSessions);
  } catch (err) {
    res.status(500).json({ message: "Zoom API Error: " + err.message });
  }
});