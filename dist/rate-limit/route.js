"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateRouter = void 0;
const express_1 = __importDefault(require("express"));
const controllter_1 = require("./controllter");
exports.rateRouter = express_1.default.Router();
// @ts-ignore
exports.rateRouter.route("/").post(controllter_1.rateLimit, controllter_1.sendSms);
