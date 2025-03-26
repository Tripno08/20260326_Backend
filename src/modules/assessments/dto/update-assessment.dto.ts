import { IsOptional, IsString, IsDate, IsNumber, IsUUID, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateAssessmentDto {
  @ApiProperty({
    description: 'Data da avaliação',
    example: '2024-03-26',
    format: 'date',
    required: false
  })
  @Type(() => Date)
  @IsDate({ message: 'Data da avaliação inválida' })
  @IsOptional()
  data?: Date;

  @ApiProperty({
    description: 'Tipo da avaliação',
    example: 'Prova Bimestral',
    required: false
  })
  @IsString({ message: 'O tipo deve ser uma string' })
  @IsOptional()
  tipo?: string;

  @ApiProperty({
    description: 'Pontuação obtida na avaliação',
    example: 8.5,
    minimum: 0,
    maximum: 10,
    required: false
  })
  @IsNumber({}, { message: 'A pontuação deve ser um número' })
  @IsOptional()
  pontuacao?: number;

  @ApiProperty({
    description: 'Observações sobre a avaliação',
    example: 'Estudante demonstrou bom domínio do conteúdo',
    required: false
  })
  @IsString({ message: 'As observações devem ser uma string' })
  @IsOptional()
  observacoes?: string;

  @ApiProperty({
    description: 'Metadados adicionais da avaliação',
    example: { 'disciplina': 'Matemática', 'bimestre': 1 },
    required: false
  })
  @IsObject({ message: 'Os metadados devem ser um objeto' })
  @IsOptional()
  metadados?: Record<string, any>;

  @ApiProperty({
    description: 'ID do estudante',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID('4', { message: 'ID do estudante inválido' })
  @IsOptional()
  estudanteId?: string;
} 