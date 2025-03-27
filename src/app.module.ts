import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from './modules/cache/cache.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { EstudantesModule } from './modules/estudantes/estudantes.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { GoalsModule } from './modules/goals/goals.module';
import { TestModule } from './modules/test/test.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { PrismaService } from './shared/prisma/prisma.service';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { throttlerConfig } from './config/cache.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot(throttlerConfig),
    PrismaModule,
    RedisModule,
    CacheModule,
    AuthModule,
    EstudantesModule,
    AssessmentsModule,
    InstitutionsModule,
    GoalsModule,
    TestModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {} 