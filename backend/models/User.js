const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  oceanScores: {
    openness: { type: Number, default: 0.5 },
    conscientiousness: { type: Number, default: 0.5 },
    extraversion: { type: Number, default: 0.5 },
    agreeableness: { type: Number, default: 0.5 },
    neuroticism: { type: Number, default: 0.5 }
  },
  likedTracks: [{ type: String }] // For future feature: saving songs
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);