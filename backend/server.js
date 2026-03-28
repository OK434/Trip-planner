require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

console.log("API KEY:", process.env.GEMINI_API_KEY);

app.use(express.json());

app.use('/api/ai', aiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

app.listen(1231, () => {
  console.log("Server running on port 1231");
});