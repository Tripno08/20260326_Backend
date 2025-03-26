import { IsOptional, IsString, IsDate, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateStudentDto {
  @ApiProperty({
    description: 'Nome completo do estudante',
    example: 'Maria Silva Santos',
    required: false
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsOptional()
  nome?: string;

  @ApiProperty({
    description: 'Série/Ano do estudante',
    example: '3º Ano do Ensino Fundamental',
    required: false
  })
  @IsString({ message: 'A série deve ser uma string' })
  @IsOptional()
  serie?: string;

  @ApiProperty({
    description: 'Data de nascimento do estudante',
    example: '2015-03-15',
    format: 'date',
    required: false
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de nascimento inválida' })
  @IsOptional()
  dataNascimento?: Date;

  @ApiProperty({
    description: 'ID da instituição de ensino',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false
  })
  @IsUUID('4', { message: 'ID da instituição inválido' })
  @IsOptional()
  instituicaoId?: string;
} 