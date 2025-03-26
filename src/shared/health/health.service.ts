import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkRedis(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkDiskSpace(): Promise<{ free: number; total: number }> {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const diskPath = os.platform() === 'win32' ? 'C:' : '/';
    const stats = fs.statfsSync(diskPath);

    return {
      free: stats.bfree * stats.bsize,
      total: stats.blocks * stats.bsize,
    };
  }

  async checkMemoryUsage(): Promise<{ used: number; total: number }> {
    const os = require('os');
    const total = os.totalmem();
    const free = os.freemem();

    return {
      used: total - free,
      total,
    };
  }

  async checkSystemLoad(): Promise<number[]> {
    const os = require('os');
    return os.loadavg();
  }

  async checkUptime(): Promise<number> {
    const os = require('os');
    return os.uptime();
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      database: boolean;
      redis: boolean;
      diskSpace: { free: number; total: number };
      memoryUsage: { used: number; total: number };
      systemLoad: number[];
      uptime: number;
    };
  }> {
    const [database, redis, diskSpace, memoryUsage, systemLoad, uptime] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkDiskSpace(),
      this.checkMemoryUsage(),
      this.checkSystemLoad(),
      this.checkUptime(),
    ]);

    const status = database && redis ? 'healthy' : !database && !redis ? 'unhealthy' : 'degraded';

    return {
      status,
      details: {
        database,
        redis,
        diskSpace,
        memoryUsage,
        systemLoad,
        uptime,
      },
    };
  }
} 