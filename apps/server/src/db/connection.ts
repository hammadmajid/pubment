import mongoose from 'mongoose';
import { config } from '../config.ts';

class DatabaseConnection {
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        console.log('Already connected to MongoDB');
        return;
      }

      const uri = this.getMongoUri();

      const options = {
        ssl: config.isProduction,
        retryWrites: true,
        writeConcern: {
          w: 'majority' as const,
        },
        // Additional Mongoose-specific options
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      };

      await mongoose.connect(uri, options);

      this.isConnected = true;
      console.log('Connected to MongoDB successfully with Mongoose');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private getMongoUri(): string {
    const uri = config.mongoUri;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    return uri;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  getConnection(): typeof mongoose.connection {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return mongoose.connection;
  }

  getMongoose(): typeof mongoose {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return mongoose;
  }

  isDbConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  getDatabaseName(): string {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return mongoose.connection.db?.databaseName || 'unknown';
  }
}

export const dbConnection = new DatabaseConnection();
export default dbConnection;
