import { IsNotEmpty, IsString, IsDate, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Status, NivelIntervencao, AreaIntervencao } from '@prisma/client';

export class CreateInterventionDto {
  @ApiProperty({
    description: 'Data de início da intervenção',
    example: '2024-03-26',
    format: 'date'
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de início inválida' })
  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  dataInicio: Date;

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
    example: 'Intervenção de Leitura'
  })
  @IsString({ message: 'O tipo deve ser uma string' })
  @IsNotEmpty({ message: 'O tipo é obrigatório' })
  tipo: string;

  @ApiProperty({
    description: 'Descrição detalhada da intervenção',
    example: 'Intervenção focada em fluência de leitura com exercícios diários'
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  descricao: string;

  @ApiProperty({
    description: 'Status atual da intervenção',
    enum: Status,
    example: Status.ATIVO
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
    description: 'ID do estudante',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'ID do estudante inválido' })
  @IsNotEmpty({ message: 'O ID do estudante é obrigatório' })
  estudanteId: string;

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
    example: NivelIntervencao.SELETIVO
  })
  @IsEnum(NivelIntervencao)
  @IsNotEmpty({ message: 'O nível da intervenção é obrigatório' })
  nivel: NivelIntervencao;

  @ApiProperty({
    description: 'Área da intervenção',
    enum: AreaIntervencao,
    example: AreaIntervencao.LEITURA
  })
  @IsEnum(AreaIntervencao)
  @IsNotEmpty({ message: 'A área da intervenção é obrigatória' })
  area: AreaIntervencao;
} 