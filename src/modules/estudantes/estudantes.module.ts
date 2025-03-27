import { Module } from '@nestjs/common';
import { EstudantesController } from './estudantes.controller';
import { EstudantesService } from './estudantes.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstudantesController],
  providers: [EstudantesService],
  exports: [EstudantesService],
})
export class EstudantesModule {} 