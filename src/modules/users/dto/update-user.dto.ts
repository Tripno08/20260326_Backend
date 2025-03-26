import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CargoUsuario } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({ description: 'Email do usuário', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Senha do usuário', required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  senha?: string;

  @ApiProperty({ description: 'Nome completo do usuário', required: false })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({ description: 'Cargo do usuário', enum: CargoUsuario, required: false })
  @IsEnum(CargoUsuario)
  @IsOptional()
  cargo?: CargoUsuario;

  @ApiProperty({ description: 'URL do avatar do usuário', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;
} 