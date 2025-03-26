import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Plataforma } from '@prisma/client';

export class CreateIntegrationDto {
  @ApiProperty({
    description: 'Nome da integração',
    example: 'Google Classroom - Escola XYZ'
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'Plataforma de integração',
    enum: Plataforma,
    example: Plataforma.GOOGLE_CLASSROOM
  })
  @IsEnum(Plataforma, { message: 'Plataforma inválida' })
  @IsNotEmpty({ message: 'A plataforma é obrigatória' })
  plataforma: Plataforma;

  @ApiProperty({
    description: 'Client ID da integração',
    example: '123456789-abcdef.apps.googleusercontent.com'
  })
  @IsString({ message: 'O client ID deve ser uma string' })
  @IsNotEmpty({ message: 'O client ID é obrigatório' })
  clientId: string;

  @ApiProperty({
    description: 'Client Secret da integração',
    example: 'GOCSPX-abcdef1234567890'
  })
  @IsString({ message: 'O client secret deve ser uma string' })
  @IsNotEmpty({ message: 'O client secret é obrigatório' })
  clientSecret: string;

  @ApiProperty({
    description: 'Tenant ID (apenas para Microsoft)',
    example: '12345678-1234-1234-1234-123456789012',
    required: false
  })
  @IsString({ message: 'O tenant ID deve ser uma string' })
  @IsOptional()
  tenantId?: string;

  @ApiProperty({
    description: 'URL de redirecionamento após autenticação',
    example: 'https://api.innerview.com.br/auth/callback'
  })
  @IsString({ message: 'A URL de redirecionamento deve ser uma string' })
  @IsNotEmpty({ message: 'A URL de redirecionamento é obrigatória' })
  redirectUri: string;

  @ApiProperty({
    description: 'Escopos necessários para a integração',
    example: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly'
  })
  @IsString({ message: 'Os escopos devem ser uma string' })
  @IsNotEmpty({ message: 'Os escopos são obrigatórios' })
  escopos: string;

  @ApiProperty({
    description: 'Indica se a integração está ativa',
    example: true,
    default: true,
    required: false
  })
  @IsBoolean({ message: 'O status deve ser um booleano' })
  @IsOptional()
  ativo?: boolean;
} 