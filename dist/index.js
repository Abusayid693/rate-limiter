"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const pg_1 = require("pg");
const app = (0, express_1.default)();
// Initialize Redis client
const redisClient = (0, redis_1.createClient)({ url: `redis://${process.env.REDIS_HOST}:6379` });
redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});
// Initialize PostgreSQL pool
const pgPool = new pg_1.Pool({
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
app.get('/redis', async (req, res) => {
    try {
        await redisClient.connect();
        await redisClient.set('key', 'value');
        const value = await redisClient.get('key');
        res.send(`Redis Value: ${value}`);
    }
    catch (err) {
        res.status(500).send(`Redis error: ${err}`);
    }
    finally {
        await redisClient.disconnect();
    }
});
// PostgreSQL test route
app.get('/postgres', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT NOW()');
        res.send(`PostgreSQL Time: ${result.rows[0].now}`);
    }
    catch (err) {
        res.status(500).send(`PostgreSQL error: ${err}`);
    }
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
