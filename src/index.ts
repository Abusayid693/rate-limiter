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

// Initialize Redis client

app.use('/api/rate', rateRouter);
app.use('/api/stats', statsRouter);

redisClient.on("error", (err:any) => {
  console.error("Redis connection error:", err);
});

createTables();
