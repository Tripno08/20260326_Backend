import { IsOptional, IsString, IsBoolean, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Plataforma } from '@prisma/client';

class ConfiguracaoLtiDto {
  @ApiProperty({ description: 'URL do endpoint LTI', required: false })
  @IsString()
  @IsOptional()
  endpointUrl?: string;

  @ApiProperty({ description: 'Chave do consumidor LTI', required: false })
  @IsString()
  @IsOptional()
  consumerKey?: string;

  @ApiProperty({ description: 'Segredo do consumidor LTI', required: false })
  @IsString()
  @IsOptional()
  consumerSecret?: string;
}

class ConfiguracaoOAuthDto {
  @ApiProperty({ description: 'Client ID do OAuth', required: false })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ description: 'Client Secret do OAuth', required: false })
  @IsString()
  @IsOptional()
  clientSecret?: string;

  @ApiProperty({ description: 'URL de redirecionamento do OAuth', required: false })
  @IsString()
  @IsOptional()
  redirectUri?: string;
}

export class UpdateIntegrationDto {
  @ApiProperty({
    description: 'Nome da integração',
    example: 'Google Classroom - Escola XYZ',
    required: false
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsOptional()
  nome?: string;

  @ApiProperty({
    description: 'Descrição detalhada da integração',
    example: 'Integração para sincronização de turmas e estudantes com Google Classroom',
    required: false
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Plataforma de integração',
    enum: Plataforma,
    example: Plataforma.GOOGLE_CLASSROOM,
    required: false
  })
  @IsEnum(Plataforma, { message: 'Plataforma inválida' })
  @IsOptional()
  plataforma?: Plataforma;

  @ApiProperty({
    description: 'Configurações específicas para integração LTI',
    type: ConfiguracaoLtiDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracaoLtiDto)
  configuracaoLti?: ConfiguracaoLtiDto;

  @ApiProperty({
    description: 'Configurações específicas para integração OAuth',
    type: ConfiguracaoOAuthDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracaoOAuthDto)
  configuracaoOAuth?: ConfiguracaoOAuthDto;

  @ApiProperty({
    description: 'Configurações adicionais específicas da plataforma',
    type: Object,
    required: false
  })
  @IsObject()
  @IsOptional()
  configuracaoAdicional?: Record<string, any>;

  @ApiProperty({
    description: 'Client ID da integração',
    example: '123456789-abcdef.apps.googleusercontent.com',
    required: false
  })
  @IsString({ message: 'O client ID deve ser uma string' })
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'Client Secret da integração',
    example: 'GOCSPX-abcdef1234567890',
    required: false
  })
  @IsString({ message: 'O client secret deve ser uma string' })
  @IsOptional()
  clientSecret?: string;

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
    example: 'https://api.innerview.com.br/auth/callback',
    required: false
  })
  @IsString({ message: 'A URL de redirecionamento deve ser uma string' })
  @IsOptional()
  redirectUri?: string;

  @ApiProperty({
    description: 'Escopos necessários para a integração',
    example: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly',
    required: false
  })
  @IsString({ message: 'Os escopos devem ser uma string' })
  @IsOptional()
  escopos?: string;

  @ApiProperty({
    description: 'Indica se a integração está ativa',
    example: true,
    required: false
  })
  @IsBoolean({ message: 'O status deve ser um booleano' })
  @IsOptional()
  ativo?: boolean;
} 