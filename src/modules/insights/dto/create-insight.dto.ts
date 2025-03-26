import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoInsight {
  PREDITIVO = 'PREDITIVO',
  DESCRITIVO = 'DESCRITIVO',
  PRESCRITIVO = 'PRESCRITIVO'
}

export enum NivelRisco {
  BAIXO = 'BAIXO',
  MODERADO = 'MODERADO',
  ALTO = 'ALTO',
  MUITO_ALTO = 'MUITO_ALTO'
}

class MetricaInsightDto {
  @ApiProperty({ description: 'Nome da métrica' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ description: 'Valor da métrica' })
  @IsString()
  @IsNotEmpty()
  valor: string;

  @ApiProperty({ description: 'Unidade de medida da métrica' })
  @IsString()
  @IsNotEmpty()
  unidade: string;
}

class RecomendacaoInsightDto {
  @ApiProperty({ description: 'Descrição da recomendação' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ description: 'Prioridade da recomendação (1-5)', minimum: 1, maximum: 5 })
  @IsString()
  @IsNotEmpty()
  prioridade: string;

  @ApiProperty({ description: 'Impacto esperado da recomendação' })
  @IsString()
  @IsNotEmpty()
  impacto: string;
}

export class CreateInsightDto {
  @ApiProperty({
    description: 'Título do insight',
    example: 'Análise de Risco Acadêmico',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Descrição detalhada do insight',
    example: 'Análise preditiva do risco de evasão escolar baseada em métricas históricas',
    required: false
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Tipo do insight',
    enum: TipoInsight,
    example: TipoInsight.PREDITIVO
  })
  @IsEnum(TipoInsight)
  @IsNotEmpty()
  tipo: TipoInsight;

  @ApiProperty({
    description: 'Nível de risco identificado',
    enum: NivelRisco,
    example: NivelRisco.MODERADO,
    required: false
  })
  @IsEnum(NivelRisco)
  @IsOptional()
  nivelRisco?: NivelRisco;

  @ApiProperty({
    description: 'Métricas associadas ao insight',
    type: [MetricaInsightDto],
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetricaInsightDto)
  @IsOptional()
  metricas?: MetricaInsightDto[];

  @ApiProperty({
    description: 'Recomendações baseadas no insight',
    type: [RecomendacaoInsightDto],
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecomendacaoInsightDto)
  @IsOptional()
  recomendacoes?: RecomendacaoInsightDto[];

  @ApiProperty({
    description: 'Dados adicionais específicos do insight',
    type: Object,
    required: false
  })
  @IsObject()
  @IsOptional()
  dadosAdicionais?: Record<string, any>;
} 