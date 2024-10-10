import { NextFunction, Request, Response } from "express";
import { SmsLog } from "../db";

export const getStats = async (
  req: Request,
  res: Response,
) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    res
      .status(400)
      .json({ message: "Phone number and IP address are required" });
  }

  const ipAddress = req.ip;

  if(!ipAddress){
    res.status(500).send("Failed to send SMS");
  }

  try {
    const logs = await SmsLog.findAll({
      where: {
        phone_number: phoneNumber,
        ip_address: ipAddress,
      },
      order: [["timestamp", "DESC"]], // Order by timestamp in descending order
    });

    // Send response with the logs
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).send("Internal Server Error");
  }
};