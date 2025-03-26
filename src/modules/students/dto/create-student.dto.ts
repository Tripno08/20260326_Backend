import { IsNotEmpty, IsString, IsDate, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nome completo do estudante',
    example: 'Maria Silva Santos'
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'Série/Ano do estudante',
    example: '3º Ano do Ensino Fundamental'
  })
  @IsString({ message: 'A série deve ser uma string' })
  @IsNotEmpty({ message: 'A série é obrigatória' })
  serie: string;

  @ApiProperty({
    description: 'Data de nascimento do estudante',
    example: '2015-03-15',
    format: 'date'
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de nascimento inválida' })
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória' })
  dataNascimento: Date;

  @ApiProperty({
    description: 'ID do usuário responsável pelo estudante',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'ID do usuário inválido' })
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  usuarioId: string;

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