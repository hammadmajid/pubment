import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import userRoutes from './routes/userRoutes.ts';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/user', userRoutes);

export default app;
