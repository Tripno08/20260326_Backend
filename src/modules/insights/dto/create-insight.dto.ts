import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoInsight {
  ACADEMICO = 'ACADEMICO',
  COMPORTAMENTAL = 'COMPORTAMENTAL',
  PSICOLOGICO = 'PSICOLOGICO',
  FINANCEIRO = 'FINANCEIRO',
  DESCRITIVO = 'DESCRITIVO',
  PREDITIVO = 'PREDITIVO',
}

export enum NivelRisco {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  CRITICO = 'CRITICO',
  MUITO_ALTO = 'MUITO_ALTO',
  MODERADO = 'MODERADO',
}

export class MetricaInsightDto {
  @ApiProperty({ description: 'Nome da métrica', example: 'Taxa de Absenteísmo' })
  @IsNotEmpty({ message: 'O nome da métrica é obrigatório' })
  @IsString({ message: 'O nome da métrica deve ser uma string' })
  nome: string;

  @ApiProperty({ description: 'Valor da métrica', example: '15' })
  @IsNotEmpty({ message: 'O valor da métrica é obrigatório' })
  @IsString({ message: 'O valor da métrica deve ser uma string' })
  valor: string;

  @ApiProperty({ description: 'Unidade da métrica', example: '%' })
  @IsNotEmpty({ message: 'A unidade da métrica é obrigatória' })
  @IsString({ message: 'A unidade da métrica deve ser uma string' })
  unidade: string;
}

export class RecomendacaoInsightDto {
  @ApiProperty({ description: 'Descrição da recomendação', example: 'Realizar intervenção pedagógica com foco em matemática' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString({ message: 'A descrição deve ser uma string' })
  descricao: string;

  @ApiProperty({ description: 'Prioridade da recomendação', example: 'Alta' })
  @IsNotEmpty({ message: 'A prioridade é obrigatória' })
  @IsString({ message: 'A prioridade deve ser uma string' })
  prioridade: string;

  @ApiProperty({ description: 'Impacto esperado da recomendação', example: 'Melhora no desempenho acadêmico' })
  @IsNotEmpty({ message: 'O impacto é obrigatório' })
  @IsString({ message: 'O impacto deve ser uma string' })
  impacto: string;
}

export class CreateInsightDto {
  @ApiProperty({ description: 'Título do insight', example: 'Queda no desempenho acadêmico' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @IsString({ message: 'O título deve ser uma string' })
  titulo: string;

  @ApiProperty({ description: 'Descrição do insight', example: 'Queda significativa no desempenho acadêmico nas últimas avaliações' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString({ message: 'A descrição deve ser uma string' })
  descricao: string;

  @ApiProperty({ description: 'Tipo do insight', enum: TipoInsight, example: TipoInsight.ACADEMICO })
  @IsEnum(TipoInsight, { message: 'O tipo do insight deve ser válido' })
  @IsNotEmpty({ message: 'O tipo do insight é obrigatório' })
  tipo: TipoInsight;

  @ApiProperty({ description: 'Nível de risco do insight', enum: NivelRisco, example: NivelRisco.MEDIO })
  @IsEnum(NivelRisco, { message: 'O nível de risco deve ser válido' })
  @IsNotEmpty({ message: 'O nível de risco é obrigatório' })
  nivelRisco: NivelRisco;

  @ApiProperty({ description: 'Métricas relacionadas ao insight', type: [MetricaInsightDto] })
  @IsArray({ message: 'As métricas devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => MetricaInsightDto)
  @IsNotEmpty({ message: 'Deve haver pelo menos uma métrica' })
  metricas: MetricaInsightDto[];

  @ApiProperty({ description: 'Recomendações para o insight', type: [RecomendacaoInsightDto] })
  @IsArray({ message: 'As recomendações devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => RecomendacaoInsightDto)
  @IsNotEmpty({ message: 'Deve haver pelo menos uma recomendação' })
  recomendacoes: RecomendacaoInsightDto[];

  @ApiProperty({ description: 'ID do estudante relacionado ao insight', example: 'uuid-do-estudante', required: false })
  @IsOptional()
  @IsString({ message: 'O ID do estudante deve ser uma string' })
  estudanteId?: string;

  @ApiProperty({
    description: 'Dados adicionais específicos do insight',
    type: Object,
    required: false
  })
  @IsObject()
  @IsOptional()
  dadosAdicionais?: Record<string, any>;
} 