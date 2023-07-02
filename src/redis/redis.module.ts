import { Module, DynamicModule } from '@nestjs/common';
import { RedisClientOptions } from 'redis';
import { RedisService, REDIS_CLIENT_OPTIONS } from './redis.service';

@Module({})
export class RedisModule {
  static register(options: RedisClientOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        { provide: REDIS_CLIENT_OPTIONS, useValue: options },
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}
