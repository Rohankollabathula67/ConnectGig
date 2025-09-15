import { Module } from '@nestjs/common';
import { PublicModule } from './public/public.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { WorkersModule } from './workers/workers.module';
import { SkillsModule } from './skills/skills.module';
import { MessagingModule } from './messaging/messaging.module';
import { MatchingModule } from './matching/matching.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    
    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes
    }),
    
    // Database
    DatabaseModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    JobsModule,
    WorkersModule,
    SkillsModule,
    MessagingModule,
    MatchingModule,
    RedisModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
