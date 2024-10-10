import express, { Request, Response } from 'express';
import { createClient } from 'redis';
import { Pool } from 'pg';

const app = express();

// Initialize Redis client
const redisClient = createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Initialize PostgreSQL pool
const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

pgPool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Redis test route
app.get('/redis', async (req: Request, res: Response) => {
  try {
    await redisClient.connect();
    await redisClient.set('key', 'value');
    const value = await redisClient.get('key');
    res.send(`Redis Value: ${value}`);
  } catch (err) {
    res.status(500).send(`Redis error: ${err}`);
  } finally {
    await redisClient.disconnect();
  }
});

// PostgreSQL test route
app.get('/postgres', async (req: Request, res: Response) => {
  try {
    const result = await pgPool.query('SELECT NOW()');
    res.send(`PostgreSQL Time: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send(`PostgreSQL error: ${err}`);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
