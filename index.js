import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import letterRoutes from './routes/letterRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import wordRoutes from './routes/wordRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

// Initialize config
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('ISYARA API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 