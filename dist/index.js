"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const redisSetup_1 = require("./redisSetup");
const db_1 = require("./db");
const route_1 = require("./rate-limit/route");
const route_2 = require("./stats/route");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// Initialize Redis client
app.use('/api/rate', route_1.rateRouter);
app.use('/api/stats', route_2.statsRouter);
redisSetup_1.redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});
(0, db_1.createTables)();
