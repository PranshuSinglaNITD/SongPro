require('dotenv').config();
const express=require('express');
const cors=require('cors');
const connectDb=require('./config/db.js')
const app=express();
connectDb();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('SongPro is running...');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});