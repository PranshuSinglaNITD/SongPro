const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');
const InteractionLog = require('../models/InteractionLog');
const auth = require('../middleware/auth');

// This points to your Python microservice
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

router.post('/', auth, async (req, res) => {
  try {
    const { query, hourOfDay } = req.body;
    const userId = req.user.id;

    // 1. Fetch user personality profile from MongoDB
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Format OCEAN scores into the array expected by Python
    const oceanArray = [
      user.oceanScores.openness,
      user.oceanScores.conscientiousness,
      user.oceanScores.extraversion,
      user.oceanScores.agreeableness,
      user.oceanScores.neuroticism
    ];

    // 2. Query Python ML microservice
    const mlResponse = await axios.post(`${FASTAPI_URL}/recommend`, {
      chat_query: query || "music for right now",
      ocean: oceanArray,
      hour_of_day: typeof hourOfDay === 'number' ? hourOfDay : new Date().getHours(),
      top_k: 12,
      max_per_artist: 2
    });

    const recommendedTracks = mlResponse.data;

    // 3. Log query telemetry asynchronously (doesn't block the user's response)
    if (recommendedTracks.length > 0) {
      InteractionLog.create({
        userId,
        chatQuery: query,
        hourOfDay: hourOfDay,
        topRecommendedTrackId: recommendedTracks[0].track_id
      }).catch(err => console.error("Telemetry write failed:", err.message));
    }

    // 4. Return tracks to React
    return res.json({ success: true, tracks: recommendedTracks });

  } catch (error) {
    console.error('Recommendation Route Failure:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to generate recommendations. Ensure FastAPI is running.' });
  }
});

module.exports = router;