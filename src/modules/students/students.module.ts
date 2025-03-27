import { Module } from '@nestjs/common';
import { EstudantesController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstudantesController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class EstudantesModule {} 