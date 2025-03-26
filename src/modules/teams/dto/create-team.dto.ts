import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CargoEquipe } from '@prisma/client';

class MembroEquipeDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsUUID()
  usuarioId: string;

  @ApiProperty({ description: 'Cargo do membro na equipe', enum: CargoEquipe })
  cargo: CargoEquipe;
}

class EstudanteEquipeDto {
  @ApiProperty({ description: 'ID do estudante' })
  @IsUUID()
  estudanteId: string;
}

export class CreateTeamDto {
  @ApiProperty({
    description: 'Nome da equipe',
    example: 'Equipe de Apoio Psicopedagógico'
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

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
    default: true,
    required: false
  })
  @IsBoolean({ message: 'O status deve ser um booleano' })
  @IsOptional()
  ativo?: boolean;

  @ApiProperty({ description: 'Lista de membros da equipe', type: [MembroEquipeDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MembroEquipeDto)
  @IsOptional()
  membros?: MembroEquipeDto[];

  @ApiProperty({ description: 'Lista de estudantes da equipe', type: [EstudanteEquipeDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstudanteEquipeDto)
  @IsOptional()
  estudantes?: EstudanteEquipeDto[];
} 