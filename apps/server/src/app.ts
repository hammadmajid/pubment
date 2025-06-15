import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import morgan from 'morgan'
import { config } from './config';
import { authenticate } from './middleware/auth';
import commentRoutes from './routes/commentRoutes';
import followRoutes from './routes/followRoutes';
import postRoutes from './routes/postRoutes';
import userRoutes from './routes/userRoutes';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(morgan('tiny'))

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/follow', authenticate, followRoutes);
app.use('/comment', authenticate, commentRoutes);

export default app;
