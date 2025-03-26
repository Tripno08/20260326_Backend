import { Module } from '@nestjs/common';
import { QueryOptimizerService } from './query-optimizer.service';
import { OptimizedQueriesService } from './optimized-queries.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [QueryOptimizerService, OptimizedQueriesService],
  exports: [QueryOptimizerService, OptimizedQueriesService],
})
export class OptimizationModule {} 