import { Injectable, NestMiddleware, mixin, Type } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { differenceInSeconds } from 'date-fns';
import { RedisService } from '../redis/redis.service';
import { TooManyRequestsException } from '../exceptions/TooManyRequests';

export interface RateLimitMiddlewareOptions {
  bucketSize?: number;
  refillRate?: number;
}

export function RateLimitMiddlewareMixin(
  options: RateLimitMiddlewareOptions,
): Type<NestMiddleware> {
  @Injectable()
  class RateLimitMiddleware implements NestMiddleware {
    bucketSize: number;
    refillRate: number;

    constructor(private readonly redisService: RedisService) {
      this.bucketSize = options.bucketSize || 4;
      this.refillRate = options.refillRate || 60;
    }

    async use(req: Request, _: Response, next: NextFunction) {
      const ip = req.ip;

      const bucket = await this.redisService.exists(ip);

      if (!bucket) {
        await this.createBucketByIp(ip);
      }

      await this.refillTokensByIp(ip);

      const tokens = await this.redisService.hget(ip, 'token');

      if (parseInt(tokens) <= 0) {
        throw new TooManyRequestsException();
      }

      await this.redisService.hset(ip, 'token', parseInt(tokens) - 1);

      next();
    }

    private async createBucketByIp(ip: string): Promise<void> {
      await this.redisService.hset(ip, 'timestamp', new Date().toISOString());
      await this.redisService.hset(ip, 'token', this.bucketSize);
    }

    private async refillTokensByIp(ip: string): Promise<void> {
      const timestamp = await this.redisService.hget(ip, 'timestamp');
      const now = new Date();
      const then = new Date(timestamp);

      const diff = differenceInSeconds(now, then);

      let filler = Math.floor(diff / this.refillRate);

      if (filler < 1) {
        return;
      } else if (filler > this.bucketSize) {
        filler = this.bucketSize;
      }

      await this.redisService.hset(ip, 'token', filler);
      await this.redisService.hset(ip, 'timestamp', new Date().toISOString());
    }
  }

  return mixin(RateLimitMiddleware);
}
