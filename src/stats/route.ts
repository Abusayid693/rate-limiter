import express, {NextFunction, Request, Response} from 'express';
import { getStats } from './controller';

export const statsRouter = express.Router();


statsRouter.route("/").get(getStats)