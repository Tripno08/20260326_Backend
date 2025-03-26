import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusMeta } from '@prisma/client';

export class UpdateGoalStatusDto {
  @ApiProperty({ description: 'Novo status da meta', enum: StatusMeta })
  @IsEnum(StatusMeta)
  status: StatusMeta;
} 