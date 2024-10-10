"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const db_1 = require("../db");
const redisSetup_1 = require("../redisSetup");
const getStats = async (req, res) => {
    const { phoneNumber } = req.query;
    if (!phoneNumber) {
        res
            .status(400)
            .json({ message: "Phone number and IP address are required" });
    }
    const ipAddress = req.ip;
    if (!ipAddress) {
        res.status(500).send("Failed to send SMS");
    }
    const minuteKey = `sms:${ipAddress}:${phoneNumber}:minute`;
    const dayKey = `sms:${ipAddress}:${phoneNumber}:day`;
    await redisSetup_1.redisClient.connect();
    const smsSentLastMinute = await redisSetup_1.redisClient.get(minuteKey) ?? 0;
    const smsSentToday = await redisSetup_1.redisClient.get(dayKey) ?? 0;
    try {
        const logs = await db_1.SmsLog.findAll({
            where: {
                phone_number: phoneNumber,
                ip_address: ipAddress,
            },
            order: [["createdAt", "DESC"]], // Order by timestamp in descending order
        });
        // Send response with the logs
        res.status(200).json({
            logs: logs,
            smsSentLastMinute,
            smsSentToday
        });
    }
    catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).send("Internal Server Error");
    }
    finally {
        await redisSetup_1.redisClient.disconnect();
    }
};
exports.getStats = getStats;
