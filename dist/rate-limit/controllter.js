"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = exports.rateLimit = void 0;
const redisSetup_1 = require("../redisSetup");
const db_1 = require("../db");
const rateLimit = async (req, res, next) => {
    const ip = req.ip;
    const { phoneNumber } = req.body;
    const minuteKey = `sms:${ip}:${phoneNumber}:minute`;
    const dayKey = `sms:${ip}:${phoneNumber}:day`;
    try {
        await redisSetup_1.redisClient.connect();
        const minuteCount = (await redisSetup_1.redisClient.get(minuteKey)) ?? 0;
        const dayCount = (await redisSetup_1.redisClient.get(dayKey)) ?? 0;
        // @ts-ignore
        if (dayCount >= 10) {
            await (0, db_1.logSmsRequest)(ip, phoneNumber, "Error", "Too many requests: Limit of 3 requests per minute exceeded");
            res.setHeader("Retry-After", "86400"); // Retry after 24 hours
            return res.status(429).json({
                message: "Too many requests: Limit of 10 requests per day exceeded",
                retryAfter: "24 hr",
                stamp: 86400,
            });
        }
        // @ts-ignore
        if (minuteCount >= 3) {
            await (0, db_1.logSmsRequest)(ip, phoneNumber, "Error", "Too many requests: Limit of 3 requests per minute exceeded");
            res.setHeader("Retry-After", "60"); // Retry after 1 minute
            return res.status(429).json({
                message: "Too many requests: Limit of 3 requests per minute exceeded",
                retryAfter: "1 min",
                stamp: 60,
            });
        }
        const transaction = redisSetup_1.redisClient.multi();
        transaction.incr(minuteKey);
        transaction.incr(dayKey);
        transaction.expire(minuteKey, 60); // Expire after 60 seconds
        transaction.expire(dayKey, 86400); // Expire after 24 hours (86400 seconds)
        // Execute the transaction
        await transaction.exec();
        next();
    }
    catch (error) {
        console.error("Redis error:", error);
        return res
            .status(500)
            .send("Internal Server Error: Unable to connect to Redis");
    }
    finally {
        await redisSetup_1.redisClient.disconnect();
    }
};
exports.rateLimit = rateLimit;
const sendSms = async (req, res) => {
    const { phoneNumber, message } = req.body;
    const ip = req.ip ?? "NOT_FOUND";
    if (!phoneNumber || !message) {
        res.status(400).json({ message: "Please provide phoneNumber and message" });
        return;
    }
    if (!ip) {
        res.status(500).send("Failed to send SMS");
    }
    console.log("Send SMS API CALLED");
    try {
        // Simulate SMS sending logic here
        await (0, db_1.logSmsRequest)(ip, phoneNumber, "Success", message);
        res.send(`SMS sent to ${phoneNumber}`);
    }
    catch (error) {
        res.status(500).send("Failed to send SMS");
    }
};
exports.sendSms = sendSms;
