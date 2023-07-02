import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { NestApplication } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RedisService } from '../src/redis/redis.service';

describe('AppController', () => {
  let app: NestApplication;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    redisService = moduleRef.get(RedisService);
    await app.init();
  });

  beforeEach(async () => {
    await redisService.client.FLUSHALL();
  });

  it('should return 429 to client if lack tokens', async () => {
    for (let i = 0; i < 4; i++) {
      await request(app.getHttpServer()).get('/').expect(200);
    }

    await request(app.getHttpServer()).get('/').expect(429);
  });

  afterAll(async () => {
    await app.close();
  });
});
