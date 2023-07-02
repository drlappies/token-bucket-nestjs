import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import {
  RedisClientOptions,
  createClient,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from 'redis';

export const REDIS_CLIENT_OPTIONS = 'REDIS_CLIENT_OPTIONS';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  constructor(
    @Inject(REDIS_CLIENT_OPTIONS)
    private readonly options: RedisClientOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    this.client = createClient<RedisModules, RedisFunctions, RedisScripts>(
      this.options,
    );
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.disconnect();
  }

  exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  hset(key: string, field: string, value: string | number): Promise<number> {
    return this.client.hSet(key, field, value);
  }

  hget(key: string, field: string): Promise<string> {
    return this.client.hGet(key, field);
  }
}
