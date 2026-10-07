const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');
const InteractionLog = require('../models/InteractionLog');
const auth = require('../middleware/auth');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

// --- NEW: Spotify Enrichment Service ---
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be configured.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data.access_token;
}

async function enrichWithSpotify(tracks) {
  try {
    const token = await getSpotifyToken();

    // Concurrently fetch real data for all tracks
    const enrichedTracks = await Promise.all(tracks.map(async (track) => {
      try {
        // Search Spotify using the track name and artist from our Faiss DB
        const query = encodeURIComponent(`${track.track_name} artist:${track.artists}`);
        const searchRes = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const spotifyTrack = searchRes.data.tracks.items[0];

        if (spotifyTrack) {
          return {
            ...track,
            preview_url: spotifyTrack.preview_url,
            image_url: spotifyTrack.album.images[0]?.url,
            spotify_id: spotifyTrack.id
          };
        }
        return track; // Fallback to original if not found on Spotify
      } catch (err) {
        return track;
      }
    }));
    return enrichedTracks;
  } catch (error) {
    console.error("Spotify API Error:", error.message);
    return tracks; // If Spotify fails, still return the ML data so the app doesn't crash
  }
}
// ---------------------------------------

// @route POST /api/recommendations
router.post('/', auth, async (req, res) => {
  try {
    const { query, hourOfDay } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const oceanArray = [
      user.oceanScores.openness,
      user.oceanScores.conscientiousness,
      user.oceanScores.extraversion,
      user.oceanScores.agreeableness,
      user.oceanScores.neuroticism
    ];

    const mlResponse = await axios.post(`${FASTAPI_URL}/recommend`, {
      chat_query: query || 'music for right now',
      ocean: oceanArray,
      hour_of_day: typeof hourOfDay === 'number' ? hourOfDay : new Date().getHours(),
      top_k: 12,
      max_per_artist: 2
    });

    const recommendations = mlResponse.data;
    const tracks = await enrichWithSpotify(recommendations);

    if (recommendations.length > 0) {
      InteractionLog.create({
        userId,
        chatQuery: query,
        hourOfDay,
        topRecommendedTrackId: recommendations[0].track_id
      }).catch((error) => console.error('Telemetry write failed:', error.message));
    }

    return res.json({ success: true, tracks });
  } catch (error) {
    console.error('Recommendation Route Failure:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to generate recommendations. Ensure the ML engine is running.'
    });
  }
});

// @route POST /api/recommendations/progression
router.post('/progression', auth, async (req, res) => {
  try {
    const { startQuery, endQuery, hourOfDay, steps } = req.body;
    const user = await User.findById(req.user.id);

    const oceanArray = [
      user.oceanScores.openness, user.oceanScores.conscientiousness,
      user.oceanScores.extraversion, user.oceanScores.agreeableness, user.oceanScores.neuroticism
    ];

    // 1. Get raw mathematical tracks from Python
    const mlResponse = await axios.post(`${FASTAPI_URL}/recommend/progression`, {
      start_query: startQuery,
      end_query: endQuery,
      ocean: oceanArray,
      hour_of_day: hourOfDay || new Date().getHours(),
      steps: steps || 10
    });

    // 2. Fetch Spotify metadata and IDs for previews or embedded playback
    const enrichedTracks = await enrichWithSpotify(mlResponse.data);

    // 3. Send final payload to React
    return res.json({ success: true, tracks: enrichedTracks });

  } catch (error) {
    console.error('Progression Route Failure:', error.message);
    return res.status(500).json({ error: 'Failed to generate mood progression.' });
  }
});

module.exports = router;