import mongoose from 'mongoose';
import { config } from './config';

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
        ssl: true, // Always true for Atlas
        retryWrites: true,
        writeConcern: {
          w: 'majority' as const,
        },
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4, // Force IPv4
        dbname: 'pubment',
      };

      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(uri, options);
      this.isConnected = true;
      console.log('Connected to MongoDB successfully with Mongoose');
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
