import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { TipoMeta, StatusMeta } from '@prisma/client';

export class UpdateGoalDto {
  @ApiProperty({ description: 'Título da meta', required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ description: 'Descrição da meta', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ description: 'Tipo da meta', enum: TipoMeta, required: false })
  @IsEnum(TipoMeta)
  @IsOptional()
  tipo?: TipoMeta;

  @ApiProperty({ description: 'Critério específico da meta', required: false })
  @IsString()
  @IsOptional()
  especifico?: string;

  @ApiProperty({ description: 'Critério mensurável da meta', required: false })
  @IsString()
  @IsOptional()
  mensuravel?: string;

  @ApiProperty({ description: 'Critério atingível da meta', required: false })
  @IsString()
  @IsOptional()
  atingivel?: string;

  @ApiProperty({ description: 'Critério relevante da meta', required: false })
  @IsString()
  @IsOptional()
  relevante?: string;

  @ApiProperty({ description: 'Critério temporal da meta', required: false })
  @IsString()
  @IsOptional()
  temporal?: string;

  @ApiProperty({ description: 'Data de início da meta', required: false })
  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @ApiProperty({ description: 'Data de fim da meta', required: false })
  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @ApiProperty({ description: 'Status da meta', enum: StatusMeta, required: false })
  @IsEnum(StatusMeta)
  @IsOptional()
  status?: StatusMeta;

  @ApiProperty({ description: 'Observações sobre a meta', required: false })
  @IsString()
  @IsOptional()
  observacoes?: string;
} 