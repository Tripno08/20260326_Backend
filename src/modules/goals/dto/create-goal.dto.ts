import { IsString, IsNotEmpty, IsEnum, IsDateString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoMeta, StatusMeta } from '@prisma/client';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Título da meta',
    example: 'Melhorar compreensão leitora',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Descrição detalhada da meta',
    example: 'Aumentar a compreensão leitora em 30% até o final do semestre',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Tipo da meta',
    enum: TipoMeta,
    example: TipoMeta.ACADEMICA,
  })
  @IsEnum(TipoMeta)
  tipo: TipoMeta;

  @ApiProperty({
    description: 'Critério específico da meta (SMART)',
    example: 'Aumentar pontuação no teste de compreensão leitora',
  })
  @IsString()
  @IsNotEmpty()
  especifico: string;

  @ApiProperty({
    description: 'Critério mensurável da meta (SMART)',
    example: 'Aumentar pontuação de 60 para 90 pontos',
  })
  @IsString()
  @IsNotEmpty()
  mensuravel: string;

  @ApiProperty({
    description: 'Critério atingível da meta (SMART)',
    example: 'Baseado no histórico de progresso do estudante',
  })
  @IsString()
  @IsNotEmpty()
  atingivel: string;

  @ApiProperty({
    description: 'Critério relevante da meta (SMART)',
    example: 'Alinhado com as necessidades educacionais do estudante',
  })
  @IsString()
  @IsNotEmpty()
  relevante: string;

  @ApiProperty({
    description: 'Critério temporal da meta (SMART)',
    example: 'Até o final do semestre letivo',
  })
  @IsString()
  @IsNotEmpty()
  temporal: string;

  @ApiProperty({
    description: 'Data de início da meta',
    example: '2024-03-26',
  })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({
    description: 'Data de fim da meta',
    example: '2024-06-26',
  })
  @IsDateString()
  dataFim: string;

  @ApiProperty({
    description: 'Status inicial da meta',
    enum: StatusMeta,
    example: StatusMeta.NAO_INICIADA,
  })
  @IsEnum(StatusMeta)
  status: StatusMeta;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Necessário acompanhamento semanal',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacoes?: string;

  @ApiProperty({
    description: 'ID da intervenção associada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  intervencaoId: string;
} 