import express, { NextFunction, Request, Response } from "express";
import { createClient } from "redis";
import { Pool } from "pg";
import { Sequelize, DataTypes } from "sequelize";
import bodyParser from "body-parser";
import moment from "moment";

const app = express();
app.use(bodyParser.json());

// Initialize Redis client
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

const sequelize = new Sequelize(
  process.env.POSTGRES_DB as string,
  process.env.POSTGRES_USER as string,
  process.env.POSTGRES_PASSWORD as string,
  {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
  }
);

const SmsLog = sequelize.define("SmsLog", {
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true, // Set to false if this field is required
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false, // Phone number is required
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true, // Set to false if this field is required
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true, // Set to false if this field is required
  },
});

const createTables = async () => {
  try {
    await sequelize.authenticate(); // Check connection
    console.log("Connection has been established successfully.");
    await sequelize.sync(); // Create tables if they don't exist
    console.log('Tables "SmsLog" are ready');
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
};

createTables();

const logSmsRequest = async (
  ip: string,
  phoneNumber: string,
  status: string,
  message: string
) => {
  await SmsLog.create({
    ip_address: ip,
    phone_number: phoneNumber,
    status,
    message,
  });
};

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip as string;
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
      await logSmsRequest(ip, phoneNumber, "Error", "Too many requests: Limit of 3 requests per minute exceeded");
      res.setHeader("Retry-After", "60"); // Retry after 1 minute
      return res.status(429).json({
        message: "Too many requests: Limit of 3 requests per minute exceeded",
        retryAfter: "1 min",
        stamp: 60,
      });
    }

    // @ts-ignore
    if (dayCount > 10) {
      await logSmsRequest(ip, phoneNumber, "Error", "Too many requests: Limit of 3 requests per minute exceeded");
      res.setHeader("Retry-After", "86400"); // Retry after 24 hours
      return res.status(429).json({
        message: "Too many requests: Limit of 10 requests per day exceeded",
        retryAfter: "24 hr",
        stamp: 86400,
      });
    }

    // Proceed to the next middleware if limits are not exceeded
    next();
  } catch (error) {
    console.error("Redis error:", error);
    return res
      .status(500)
      .send("Internal Server Error: Unable to connect to Redis");
  } finally {
    await redisClient.disconnect();
  }
};

const sendSms = async (req: Request, res: Response) => {
  const { phoneNumber, message } = req.body;
  const ip = req.ip ?? "NOT_FOUND";

  console.log("Send SMS API CALLED");

  try {
    // Simulate SMS sending logic here
    await logSmsRequest(ip, phoneNumber, "Success", message);
    res.send(`SMS sent to ${phoneNumber}`);
  } catch (error: any) {
  
    res.status(500).send("Failed to send SMS");
  }
};

// @ts-ignore
app.post("/send-sms", rateLimiter, sendSms);

// Redis test route
app.get("/redisn", async (req: Request, res: Response) => {
  try {
    await redisClient.connect();
    await redisClient.set("key", "value");
    const value = await redisClient.get("key");
    res.send(`Redis Value: ${value}`);
  } catch (err) {
    res.status(500).send(`Redis error: ${err}`);
  } finally {
    await redisClient.disconnect();
  }
});


// @ts-ignore
app.get("/stats", async (req: Request, res: Response) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res
      .status(400)
      .json({ message: "Phone number and IP address are required" });
  }

  const ipAddress = req.ip 

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
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
