import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiProperty({
    description: 'Nome da equipe',
    example: 'Equipe de Apoio Psicopedagógico',
    required: false
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsOptional()
  nome?: string;

  @ApiProperty({
    description: 'Descrição detalhada da equipe',
    example: 'Equipe responsável pelo acompanhamento psicopedagógico dos estudantes',
    required: false
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Indica se a equipe está ativa',
    example: true,
    required: false
  })
  @IsBoolean({ message: 'O status deve ser um booleano' })
  @IsOptional()
  ativo?: boolean;
} 