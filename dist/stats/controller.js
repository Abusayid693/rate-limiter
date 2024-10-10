"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const db_1 = require("../db");
const getStats = async (req, res, next) => {
    const { phoneNumber } = req.query;
    if (!phoneNumber) {
        res
            .status(400)
            .json({ message: "Phone number and IP address are required" });
        return;
    }
    const ipAddress = req.ip;
    try {
        const logs = await db_1.SmsLog.findAll({
            where: {
                phone_number: phoneNumber,
                ip_address: ipAddress,
            },
            order: [["timestamp", "DESC"]], // Order by timestamp in descending order
        });
        // Send response with the logs
        res.status(200).json(logs);
    }
    catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).send("Internal Server Error");
    }
};
exports.getStats = getStats;
// export const getStats = async (req: Request, res: Response,   next: NextFunction) => {
//     const { phoneNumber } = req.query;
//     const ip = req.ip ?? "NOT_FOUND";
//     console.log("Send SMS API CALLED");
//     try {
//       // Simulate SMS sending logic here
//       res.send(`SMS sent to ${phoneNumber}`);
//     } catch (error: any) {
//       res.status(500).send("Failed to send SMS");
//     }
//   };
