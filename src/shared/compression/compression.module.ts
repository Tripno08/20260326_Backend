import { Module } from '@nestjs/common';
import { CompressionInterceptor } from './compression.interceptor';

@Module({
  providers: [CompressionInterceptor],
  exports: [CompressionInterceptor],
})
export class CompressionModule {} 