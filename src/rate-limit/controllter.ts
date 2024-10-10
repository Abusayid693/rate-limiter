import express, { NextFunction, Request, Response } from "express";
import { redisClient } from "../redisSetup";
import { logSmsRequest } from "../db";

export const rateLimit = async (
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
    if (dayCount > 10) {
      await logSmsRequest(
        ip,
        phoneNumber,
        "Error",
        "Too many requests: Limit of 3 requests per minute exceeded"
      );
      res.setHeader("Retry-After", "86400"); // Retry after 24 hours
      return res.status(429).json({
        message: "Too many requests: Limit of 10 requests per day exceeded",
        retryAfter: "24 hr",
        stamp: 86400,
      });
    }

    // @ts-ignore
    if (minuteCount > 3) {
      await logSmsRequest(
        ip,
        phoneNumber,
        "Error",
        "Too many requests: Limit of 3 requests per minute exceeded"
      );
      res.setHeader("Retry-After", "60"); // Retry after 1 minute
      return res.status(429).json({
        message: "Too many requests: Limit of 3 requests per minute exceeded",
        retryAfter: "1 min",
        stamp: 60,
      });
    }

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

export const sendSms = async (
  req: Request,
  res: Response,
) => {
  const { phoneNumber, message } = req.body;
  const ip = req.ip ?? "NOT_FOUND";

  if (!phoneNumber || !message) {
    res
      .status(400)
      .json({ message: "Please provide phoneNumber and message" });
    return;
  }

  if(!ip){
    res.status(500).send("Failed to send SMS");
  }

  console.log("Send SMS API CALLED");

  try {
    // Simulate SMS sending logic here
    await logSmsRequest(ip, phoneNumber, "Success", message);
    res.send(`SMS sent to ${phoneNumber}`);
  } catch (error: any) {
    res.status(500).send("Failed to send SMS");
  }
};
