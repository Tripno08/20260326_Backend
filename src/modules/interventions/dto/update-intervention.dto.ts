import { IsOptional, IsString, IsDate, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Status, NivelIntervencao, AreaIntervencao } from '@prisma/client';

export class UpdateInterventionDto {
  @ApiProperty({
    description: 'Data de início da intervenção',
    example: '2024-03-26',
    format: 'date',
    required: false
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de início inválida' })
  @IsOptional()
  dataInicio?: Date;

  @ApiProperty({
    description: 'Data de fim prevista da intervenção',
    example: '2024-06-26',
    format: 'date',
    required: false
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de fim inválida' })
  @IsOptional()
  dataFim?: Date;

  @ApiProperty({
    description: 'Tipo da intervenção',
    example: 'Intervenção de Leitura',
    required: false
  })
  @IsString({ message: 'O tipo deve ser uma string' })
  @IsOptional()
  tipo?: string;

  @ApiProperty({
    description: 'Descrição detalhada da intervenção',
    example: 'Intervenção focada em fluência de leitura com exercícios diários',
    required: false
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Status atual da intervenção',
    enum: Status,
    example: Status.ATIVO,
    required: false
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({
    description: 'Observações adicionais sobre a intervenção',
    example: 'Estudante demonstra boa receptividade às atividades',
    required: false
  })
  @IsString({ message: 'As observações devem ser uma string' })
  @IsOptional()
  observacoes?: string;

  @ApiProperty({
    description: 'ID da intervenção base (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false
  })
  @IsUUID('4', { message: 'ID da intervenção base inválido' })
  @IsOptional()
  intervencaoBaseId?: string;

  @ApiProperty({
    description: 'Nível da intervenção',
    enum: NivelIntervencao,
    example: NivelIntervencao.SELETIVO,
    required: false
  })
  @IsEnum(NivelIntervencao)
  @IsOptional()
  nivel?: NivelIntervencao;

  @ApiProperty({
    description: 'Área da intervenção',
    enum: AreaIntervencao,
    example: AreaIntervencao.LEITURA,
    required: false
  })
  @IsEnum(AreaIntervencao)
  @IsOptional()
  area?: AreaIntervencao;
} 