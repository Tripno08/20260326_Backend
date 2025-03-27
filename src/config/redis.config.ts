import { RedisOptions } from 'ioredis';

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number): number => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,
  lazyConnect: true,
  reconnectOnError: (error: Error): boolean => {
    const targetError = 'READONLY';
    if (error.message.includes(targetError)) {
      return true;
    }
    return false;
  },
}; 