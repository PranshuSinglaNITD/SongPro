const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Add it to backend/.env before starting the server.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
};

module.exports = connectDB;