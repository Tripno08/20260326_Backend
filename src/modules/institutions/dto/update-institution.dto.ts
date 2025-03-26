import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum InstitutionType {
  MUNICIPAL = 'MUNICIPAL',
  ESTADUAL = 'ESTADUAL',
  FEDERAL = 'FEDERAL',
  PARTICULAR = 'PARTICULAR',
}

export class UpdateInstitutionDto {
  @ApiProperty({ required: false, description: 'Nome da instituição' })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({ required: false, enum: InstitutionType, description: 'Tipo da instituição' })
  @IsEnum(InstitutionType)
  @IsOptional()
  tipo?: InstitutionType;

  @ApiProperty({ required: false, description: 'Endereço da instituição' })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({ required: false, description: 'Configurações da instituição em formato JSON' })
  @IsString()
  @IsOptional()
  configuracoes?: string;

  @ApiProperty({ required: false, description: 'Status de ativação da instituição' })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
} 