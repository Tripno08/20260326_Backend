import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import { TipoInsight, NivelRisco } from './dto/create-insight.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Criar um novo insight' })
  @ApiResponse({ status: 201, description: 'Insight criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createInsightDto: CreateInsightDto) {
    return this.insightsService.create(createInsightDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os insights' })
  @ApiResponse({ status: 200, description: 'Lista de insights retornada com sucesso' })
  findAll(
    @Query('tipo') tipo?: TipoInsight,
    @Query('nivelRisco') nivelRisco?: NivelRisco,
    @Query('dataInicio') dataInicio?: Date,
    @Query('dataFim') dataFim?: Date,
  ) {
    return this.insightsService.findAll({ tipo, nivelRisco, dataInicio, dataFim });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um insight específico' })
  @ApiResponse({ status: 200, description: 'Insight encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Insight não encontrado' })
  findOne(@Param('id') id: string) {
    return this.insightsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar um insight' })
  @ApiResponse({ status: 200, description: 'Insight atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Insight não encontrado' })
  update(@Param('id') id: string, @Body() updateInsightDto: UpdateInsightDto) {
    return this.insightsService.update(id, updateInsightDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remover um insight' })
  @ApiResponse({ status: 200, description: 'Insight removido com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Insight não encontrado' })
  remove(@Param('id') id: string) {
    return this.insightsService.remove(id);
  }

  @Post('estudante/:estudanteId/predicao')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Gerar insights preditivos para um estudante' })
  @ApiResponse({ status: 201, description: 'Insights preditivos gerados com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  gerarInsightPredativo(@Param('estudanteId') estudanteId: string) {
    return this.insightsService.gerarInsightPredativo(estudanteId);
  }
} 