import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { InstitutionType } from './update-institution.dto';

export class CreateInstitutionDto {
  @ApiProperty({
    description: 'Nome da instituição',
    example: 'Escola Municipal João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    enum: InstitutionType,
    description: 'Tipo da instituição',
  })
  @IsEnum(InstitutionType)
  @IsNotEmpty()
  tipo: InstitutionType;

  @ApiProperty({
    description: 'Endereço da instituição',
    example: 'Rua das Flores, 123 - Centro',
    required: false,
  })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({
    description: 'Configurações da instituição em formato JSON',
    example: '{"horarioFuncionamento": "08:00-17:00", "niveisEnsino": ["Fundamental", "Médio"]}',
    required: false,
  })
  @IsString()
  @IsOptional()
  configuracoes?: string;

  @ApiProperty({
    description: 'Status de ativação da instituição',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
} 