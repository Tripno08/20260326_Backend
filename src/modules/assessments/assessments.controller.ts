import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CargoUsuario } from '@prisma/client';

@Controller('assessments')
@ApiTags('Avaliações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Criar uma nova avaliação' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  create(@Body() createAssessmentDto: CreateAssessmentDto) {
    return this.assessmentsService.create(createAssessmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiQuery({ name: 'estudanteId', required: false, description: 'Filtrar por ID do estudante' })
  @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de avaliação' })
  @ApiQuery({ name: 'dataInicio', required: false, description: 'Filtrar por data inicial' })
  @ApiQuery({ name: 'dataFim', required: false, description: 'Filtrar por data final' })
  findAll(
    @Query('estudanteId') estudanteId?: string,
    @Query('tipo') tipo?: string,
    @Query('dataInicio') dataInicio?: Date,
    @Query('dataFim') dataFim?: Date,
  ) {
    return this.assessmentsService.findAll({ estudanteId, tipo, dataInicio, dataFim });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma avaliação por ID' })
  @ApiResponse({ status: 200, description: 'Avaliação encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.assessmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Atualizar uma avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() updateAssessmentDto: UpdateAssessmentDto) {
    return this.assessmentsService.update(id, updateAssessmentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remover uma avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id') id: string) {
    return this.assessmentsService.remove(id);
  }

  @Get('student/:estudanteId')
  @ApiOperation({ summary: 'Buscar avaliações por ID do estudante' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findByStudent(@Param('estudanteId') estudanteId: string) {
    return this.assessmentsService.findByStudent(estudanteId);
  }

  @Get('student-id/:estudanteId')
  @ApiOperation({ summary: 'Buscar avaliações por ID do estudante (método alternativo)' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findByStudentId(@Param('estudanteId') estudanteId: string) {
    return this.assessmentsService.findByStudentId(estudanteId);
  }

  @Get('type/:tipo')
  @ApiOperation({ summary: 'Buscar avaliações por tipo' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findByType(@Param('tipo') tipo: string) {
    return this.assessmentsService.findByType(tipo);
  }
} 