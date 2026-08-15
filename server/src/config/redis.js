import { createClient } from 'redis';
import { env } from './env.js';

let redisClient;

export const connectRedis = async () => {
  redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis connected successfully'));

  await redisClient.connect();
};

export const getRedisClient = () => redisClient;
