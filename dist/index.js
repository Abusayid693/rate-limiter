"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const sequelize_1 = require("sequelize");
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// Initialize Redis client
const redisClient = (0, redis_1.createClient)({
    url: `redis://${process.env.REDIS_HOST}:6379`,
});
// const sequelize = new Sequelize('sms_api', 'user', 'password', {
//     host: 'localhost',
//     dialect: 'postgres'
// });
// const SmsLog = sequelize.define('SmsLog', {
//     ip_address: { type: DataTypes.STRING },
//     phone_number: { type: DataTypes.STRING },
//     timestamp: { type: DataTypes.DATE },
//     status: { type: DataTypes.STRING },
//     message: { type: DataTypes.TEXT }
// });
redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});
// Initialize PostgreSQL pool
// const pgPool = new Pool({
//   user: process.env.POSTGRES_USER,
//   host: process.env.POSTGRES_HOST,
//   database: process.env.POSTGRES_DB,
//   password: process.env.POSTGRES_PASSWORD,
//   port: 5432,
// });
// pgPool.on("error", (err) => {
//   console.error("PostgreSQL connection error:", err);
// });
const sequelize = new sequelize_1.Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
});
const SmsLog = sequelize.define("SmsLog", {
    ip_address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Set to false if this field is required
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false, // Phone number is required
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Set to false if this field is required
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true, // Set to false if this field is required
    },
});
const createTables = async () => {
    try {
        await sequelize.authenticate(); // Check connection
        console.log("Connection has been established successfully.");
        await sequelize.sync(); // Create tables if they don't exist
        console.log('Tables "SmsLog" are ready');
    }
    catch (err) {
        console.error("Unable to connect to the database:", err);
    }
};
createTables();
const logSmsRequest = async (ip, phoneNumber, status, message) => {
    await SmsLog.create({
        ip_address: ip,
        phone_number: phoneNumber,
        status,
        message,
    });
};
const rateLimiter = async (req, res, next) => {
    const ip = req.ip;
    const { phoneNumber } = req.body;
    // Keys for tracking the requests per minute and per day
    const minuteKey = `sms:${ip}:${phoneNumber}:minute`;
    const dayKey = `sms:${ip}:${phoneNumber}:day`;
    try {
        // Start a Redis transaction to ensure atomic operations
        await redisClient.connect();
        const transaction = redisClient.multi();
        // Increment the counters and set expiration times
        transaction.incr(minuteKey);
        transaction.incr(dayKey);
        transaction.expire(minuteKey, 60); // Expire after 60 seconds
        transaction.expire(dayKey, 86400); // Expire after 24 hours (86400 seconds)
        // Execute the transaction
        const [minuteCount, dayCount] = await transaction.exec();
        // Check rate limits
        // @ts-ignore
        if (minuteCount > 3) {
            res.setHeader("Retry-After", "60"); // Retry after 1 minute
            return res.status(429).json({
                message: "Too many requests: Limit of 3 requests per minute exceeded",
                retryAfter: "1 min",
                stamp: 60,
            });
        }
        // @ts-ignore
        if (dayCount > 10) {
            res.setHeader("Retry-After", "86400"); // Retry after 24 hours
            return res.status(429).json({
                message: "Too many requests: Limit of 10 requests per day exceeded",
                retryAfter: "24 hr",
                stamp: 86400,
            });
        }
        // Proceed to the next middleware if limits are not exceeded
        next();
    }
    catch (error) {
        console.error("Redis error:", error);
        return res
            .status(500)
            .send("Internal Server Error: Unable to connect to Redis");
    }
    finally {
        await redisClient.disconnect();
    }
};
exports.rateLimiter = rateLimiter;
const sendSms = async (req, res) => {
    const { phoneNumber, message } = req.body;
    const ip = req.ip ?? "NOT_FOUND";
    console.log("Send SMS API CALLED");
    try {
        // Simulate SMS sending logic here
        await logSmsRequest(ip, phoneNumber, "Success", message);
        res.send(`SMS sent to ${phoneNumber}`);
    }
    catch (error) {
        await logSmsRequest(ip, phoneNumber, "Error", error.message);
        res.status(500).send("Failed to send SMS");
    }
};
// @ts-ignore
app.post("/send-sms", exports.rateLimiter, sendSms);
// Redis test route
app.get("/redisn", async (req, res) => {
    try {
        await redisClient.connect();
        await redisClient.set("key", "value");
        const value = await redisClient.get("key");
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
// app.get("/postgres", async (req: Request, res: Response) => {
//   try {
//     const result = await pgPool.query("SELECT NOW()");
//     res.send(`PostgreSQL Time: ${result.rows[0].now}`);
//   } catch (err) {
//     res.status(500).send(`PostgreSQL error: ${err}`);
//   }
// });
// @ts-ignore
app.get("/stats", async (req, res) => {
    const { phoneNumber } = req.query;
    if (!phoneNumber) {
        return res
            .status(400)
            .json({ message: "Phone number and IP address are required" });
    }
    const ipAddress = req.ip;
    try {
        const logs = await SmsLog.findAll({
            where: {
                phone_number: phoneNumber,
                ip_address: ipAddress,
            },
            order: [["timestamp", "DESC"]], // Order by timestamp in descending order
        });
        // Send response with the logs
        res.json(logs);
    }
    catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
