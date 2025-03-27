import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';
import { Status } from '@prisma/client';

@ApiTags('Intervenções')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interventions')
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN, CargoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Criar uma nova intervenção' })
  @ApiResponse({ status: 201, description: 'Intervenção criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  create(@Body() createInterventionDto: CreateInterventionDto) {
    return this.interventionsService.create(createInterventionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as intervenções' })
  @ApiResponse({ status: 200, description: 'Lista de intervenções retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiQuery({ name: 'estudanteId', required: false, description: 'Filtrar por ID do estudante' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por status', enum: Status })
  @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de intervenção' })
  findAll(
    @Query('estudanteId') estudanteId?: string,
    @Query('status') status?: Status,
    @Query('tipo') tipo?: string,
  ) {
    return this.interventionsService.findAll({ estudanteId, status, tipo });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma intervenção por ID' })
  @ApiResponse({ status: 200, description: 'Intervenção encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Intervenção não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.interventionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.ADMIN, CargoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Atualizar uma intervenção' })
  @ApiResponse({ status: 200, description: 'Intervenção atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Intervenção não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() updateInterventionDto: UpdateInterventionDto) {
    return this.interventionsService.update(id, updateInterventionDto);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover uma intervenção' })
  @ApiResponse({ status: 200, description: 'Intervenção removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Intervenção não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id') id: string) {
    return this.interventionsService.remove(id);
  }

  @Get('student/:estudanteId')
  @ApiOperation({ summary: 'Buscar intervenções por ID do estudante' })
  @ApiResponse({ status: 200, description: 'Lista de intervenções retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findByStudent(@Param('estudanteId') estudanteId: string) {
    return this.interventionsService.findByStudent(estudanteId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Buscar intervenções por status' })
  @ApiResponse({ status: 200, description: 'Lista de intervenções retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findByStatus(@Param('status') status: Status) {
    return this.interventionsService.findByStatus(status);
  }

  @Get('type/:tipo')
  @ApiOperation({ summary: 'Buscar intervenções por tipo' })
  @ApiResponse({ status: 200, description: 'Lista de intervenções retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findByType(@Param('tipo') tipo: string) {
    return this.interventionsService.findByType(tipo);
  }
} 