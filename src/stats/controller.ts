import { NextFunction, Request, Response } from "express";
import { SmsLog } from "../db";
import { redisClient } from "../redisSetup";

export const getStats = async (req: Request, res: Response) => {
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

  await redisClient.connect();

  const smsSentLastMinute = await redisClient.get(minuteKey) ?? 0;
  const smsSentToday = await redisClient.get(dayKey) ?? 0;

  try {
    const logs = await SmsLog.findAll({
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
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).send("Internal Server Error");
  }
  finally {
    await redisClient.disconnect();
  }
};
