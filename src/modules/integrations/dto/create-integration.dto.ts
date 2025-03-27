import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsObject, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plataforma } from '@prisma/client';

export class CreateIntegrationDto {
  @ApiProperty({
    description: 'Nome da integração',
    example: 'Google Classroom Instituidção X'
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  nome: string;

  @ApiProperty({
    description: 'Plataforma de integração',
    enum: Plataforma,
    example: Plataforma.GOOGLE_CLASSROOM
  })
  @IsEnum(Plataforma, { message: 'A plataforma deve ser um valor válido' })
  @IsNotEmpty({ message: 'A plataforma é obrigatória' })
  plataforma: Plataforma;

  @ApiProperty({
    description: 'Client ID para autenticação OAuth',
    example: 'client_id_example'
  })
  @IsNotEmpty({ message: 'O ID do cliente é obrigatório' })
  @IsString({ message: 'O ID do cliente deve ser uma string' })
  clientId: string;

  @ApiProperty({
    description: 'Client Secret para autenticação OAuth',
    example: 'client_secret_example'
  })
  @IsNotEmpty({ message: 'O segredo do cliente é obrigatório' })
  @IsString({ message: 'O segredo do cliente deve ser uma string' })
  clientSecret: string;

  @ApiPropertyOptional({
    description: 'Tenant ID para plataformas que necessitam',
    example: 'tenant_id_example'
  })
  @IsOptional()
  @IsString({ message: 'O ID do tenant deve ser uma string' })
  tenantId?: string;

  @ApiProperty({
    description: 'URI de redirecionamento para autenticação OAuth',
    example: 'https://app.example.com/callback'
  })
  @IsNotEmpty({ message: 'A URI de redirecionamento é obrigatória' })
  @IsString({ message: 'A URI de redirecionamento deve ser uma string' })
  redirectUri: string;

  @ApiProperty({
    description: 'Escopos de permissão para autenticação OAuth',
    example: 'profile email'
  })
  @IsNotEmpty({ message: 'Os escopos são obrigatórios' })
  @IsString({ message: 'Os escopos devem ser uma string' })
  escopos: string;

  @ApiPropertyOptional({
    description: 'Status da integração',
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'O status deve ser um booleano' })
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'Configurações específicas para LTI',
    type: 'object'
  })
  @IsOptional()
  @IsObject({ message: 'As configurações LTI devem ser um objeto' })
  @ValidateIf(o => o.plataforma === Plataforma.LTI)
  configuracaoLti?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Configurações específicas para OAuth',
    type: 'object'
  })
  @IsOptional()
  @IsObject({ message: 'As configurações OAuth devem ser um objeto' })
  @ValidateIf(o => [Plataforma.GOOGLE_CLASSROOM, Plataforma.MICROSOFT_TEAMS].includes(o.plataforma))
  configuracaoOAuth?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Configurações adicionais',
    type: 'object'
  })
  @IsOptional()
  @IsObject({ message: 'As configurações adicionais devem ser um objeto' })
  configuracaoAdicional?: Record<string, any>;
} 