import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudanteDto } from './create-estudante.dto';

export class UpdateEstudanteDto {
  @ApiProperty({
    description: 'Nome do estudante',
    example: 'João Silva',
    required: false,
  })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({
    description: 'Série do estudante',
    example: '5º Ano',
    required: false,
  })
  @IsString()
  @IsOptional()
  serie?: string;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '2010-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dataNascimento?: Date;

  @ApiProperty({
    description: 'ID da instituição',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  instituicaoId?: string;
} 