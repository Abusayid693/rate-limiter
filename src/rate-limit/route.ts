import express, {NextFunction, Request, Response} from 'express';
import {  rateLimit, sendSms } from './controllter';

export const rateRouter = express.Router();

// @ts-ignore
rateRouter.route("/").post(rateLimit, sendSms)