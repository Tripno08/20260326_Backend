import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressDto {
  @ApiProperty({
    description: 'Valor numérico do progresso',
    example: 75.5,
  })
  @IsNumber()
  valor: number;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Necessário reforçar conceitos específicos',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacoes?: string;

  @ApiProperty({
    description: 'ID da meta associada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  metaId: string;
} 