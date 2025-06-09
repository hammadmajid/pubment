import { type Db, MongoClient } from 'mongodb';
import { config } from '../config.ts';

class DatabaseConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    try {
      const uri = this.getMongoUri();

      this.client = new MongoClient(uri, {
        ssl: config.isProduction,
        retryWrites: true,
        writeConcern: {
          w: 'majority',
        },
      });

      await this.client.connect();

      // Extract database name from URI
      const dbName = this.extractDbName(uri);
      this.db = this.client.db(dbName);

      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
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

  private extractDbName(uri: string): string {
    const dbName = uri.split('/').pop()?.split('?')[0];
    return dbName || 'myapp';
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client;
  }
}

export const dbConnection = new DatabaseConnection();
export default dbConnection;
