import { createClient } from "redis";

export const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:6379`,
  });