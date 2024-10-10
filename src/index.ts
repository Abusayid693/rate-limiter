import express, { NextFunction, Request, Response } from "express";
import { Pool } from "pg";
import { Sequelize, DataTypes } from "sequelize";
import bodyParser from "body-parser";
import moment from "moment";
import { redisClient } from "./redisSetup";
import { SmsLog, createTables } from "./db";
import { rateRouter } from "./rate-limit/route";
import { statsRouter } from "./stats/route";

const app = express();
app.use(bodyParser.json());

const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Initialize Redis client

app.use("/api/rate", rateRouter);
app.use("/api/stats", statsRouter);

redisClient.on("error", (err: any) => {
  console.error("Redis connection error:", err);
});

createTables();

process.on("uncaughtException", (err) => {
  console.error("Unhandled exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Shutting down...");
  server.close(() => {
    console.log("Closed all connections. Exiting...");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Shutting down...");
  server.close(() => {
    console.log("Closed all connections. Exiting...");
    process.exit(0);
  });
});
