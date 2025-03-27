import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoInsight, NivelRisco } from './create-insight.dto';

export class FindInsightQueryDto {
  @ApiPropertyOptional({ enum: TipoInsight, description: 'Tipo de insight' })
  @IsEnum(TipoInsight)
  @IsOptional()
  tipo?: TipoInsight;

  @ApiPropertyOptional({ enum: NivelRisco, description: 'Nível de risco' })
  @IsEnum(NivelRisco)
  @IsOptional()
  nivelRisco?: NivelRisco;

  @ApiPropertyOptional({ description: 'Data de início (formato ISO)' })
  @IsDateString()
  @IsOptional()
  de?: string;

  @ApiPropertyOptional({ description: 'Data de fim (formato ISO)' })
  @IsDateString()
  @IsOptional()
  ate?: string;
} 