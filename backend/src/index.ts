import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
const allowedOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : false);
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '1mb' })); // Prevent large payload DoS

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes will be added here
import authRoutes from './routes/auth.routes';
import journalRoutes from './routes/journal.routes';
import goalRoutes from './routes/goal.routes';

app.use('/auth', authRoutes);
app.use('/journals', journalRoutes);
app.use('/goals', goalRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
