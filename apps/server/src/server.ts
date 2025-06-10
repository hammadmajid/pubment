import app from './app.ts';
import { config } from './config.ts';
import dbConnection from './db.ts';

async function startServer() {
  try {
    await dbConnection.connect();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await dbConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await dbConnection.disconnect();
  process.exit(0);
});

startServer();
