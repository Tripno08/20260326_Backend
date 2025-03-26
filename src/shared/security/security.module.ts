import { Module } from '@nestjs/common';
import { SecurityTestService } from './security-test.service';
import { SecurityController } from './security.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SecurityController],
  providers: [SecurityTestService],
  exports: [SecurityTestService],
})
export class SecurityModule {} 