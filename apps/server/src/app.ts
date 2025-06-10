import express, { type Express } from 'express';
import userController from './controllers/user';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/user', userController);

export default app;
