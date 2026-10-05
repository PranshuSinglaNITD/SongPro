require('dotenv').config();
const express=require('express');
const cors=require('cors');
const connectDb=require('./config/db.js');
const app=express();

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SongPro API is running' });
});

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Add it to backend/.env before starting the server.');
  }

  await connectDb();

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
};

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exitCode = 1;
});