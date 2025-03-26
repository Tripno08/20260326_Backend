import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { CacheModule } from '../cache/cache.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CacheModule, ConfigModule],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {} 