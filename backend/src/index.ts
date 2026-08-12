import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import certificateRoutes from './routes/certificateRoutes';
import { startIndexer } from './services/indexer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'certichain-backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', certificateRoutes);

const startServer = async () => {
  await connectDB();
  await startIndexer();

  app.listen(PORT, () => {
    console.log(`[CertiChain Backend] Server running at http://localhost:${PORT}`);
  });
};

startServer();
