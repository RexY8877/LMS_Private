// src/models/Course.js (Update)
liveSessions: [
  {
    platform: { type: String, enum: ["zoom", "meet", "teams"], default: "zoom" },
    meetingId: String,   // Store Zoom's unique ID
    passcode: String,    // Store the meeting password
    link: String,        // Join URL
    scheduledAt: Date,
    durationMinutes: Number,
    status: { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" }
  },
]