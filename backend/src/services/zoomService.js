const axios = require('axios');

async function getZoomAccessToken() {
  const auth = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {},
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
}

async function createZoomMeeting({ topic, startTime, duration }) {
  const token = await getZoomAccessToken();
  const response = await axios.post(
    'https://api.zoom.us/v2/users/me/meetings',
    {
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: duration,
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return {
    meetingId: response.data.id,
    link: response.data.join_url,
    passcode: response.data.password,
  };
}

module.exports = { createZoomMeeting };