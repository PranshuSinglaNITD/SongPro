const mongoose = require('mongoose');

const InteractionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  chatQuery: { type: String, default: "" },
  hourOfDay: Number,
  topRecommendedTrackId: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InteractionLog', InteractionLogSchema);