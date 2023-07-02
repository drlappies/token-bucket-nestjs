import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { RedisModule } from './redis/redis.module';
import { RateLimitMiddlewareMixin } from './middlewares/rate_limit.middleware';

@Module({
  imports: [
    RedisModule.register({
      url: 'redis://default:chah8Om7Uqua@localhost:6379',
    }),
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RateLimitMiddlewareMixin({
          bucketSize: 4,
          refillRate: 60,
        }),
      )
      .forRoutes(AppController);
  }
}
