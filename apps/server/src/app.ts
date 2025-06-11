import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { authenticate } from './middleware/auth';
import postRoutes from './routes/postRoutes';
import userRoutes from './routes/userRoutes';
import followRoutes from './routes/followRoutes';
import commentRoutes from './routes/commentRoutes';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/user', userRoutes);
app.use('/post', authenticate, postRoutes);
app.use('/follow', authenticate, followRoutes);
app.use('/comment', authenticate, commentRoutes);

export default app;
