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
import { EstudantesService } from './estudantes.service';
import { CreateEstudanteDto } from './dto/create-estudante.dto';
import { UpdateEstudanteDto } from './dto/update-estudante.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';

@ApiTags('Estudantes')
@Controller('estudantes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EstudantesController {
  constructor(private readonly estudantesService: EstudantesService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN, CargoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Criar um novo estudante' })
  @ApiResponse({ status: 201, description: 'Estudante criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createEstudanteDto: CreateEstudanteDto) {
    return this.estudantesService.create(createEstudanteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os estudantes' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiQuery({ name: 'serie', required: false })
  @ApiQuery({ name: 'instituicaoId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('serie') serie?: string,
    @Query('instituicaoId') instituicaoId?: string,
    @Query('search') search?: string,
  ) {
    return this.estudantesService.findAll({ serie, instituicaoId, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um estudante por ID' })
  @ApiResponse({ status: 200, description: 'Estudante encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.estudantesService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.ADMIN, CargoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Atualizar um estudante' })
  @ApiResponse({ status: 200, description: 'Estudante atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() updateEstudanteDto: UpdateEstudanteDto) {
    return this.estudantesService.update(id, updateEstudanteDto);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover um estudante' })
  @ApiResponse({ status: 200, description: 'Estudante removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id') id: string) {
    return this.estudantesService.remove(id);
  }

  @Get('user/:usuarioId')
  @ApiOperation({ summary: 'Buscar estudantes por ID do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.estudantesService.findByUsuario(usuarioId);
  }

  @Get('institution/:instituicaoId')
  @ApiOperation({ summary: 'Buscar estudantes por ID da instituição' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Instituição não encontrada.' })
  findByInstituicao(@Param('instituicaoId') instituicaoId: string) {
    return this.estudantesService.findByInstituicao(instituicaoId);
  }

  @Get('serie/:serie')
  @ApiOperation({ summary: 'Buscar estudantes por série' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  findBySerie(@Param('serie') serie: string) {
    return this.estudantesService.findBySerie(serie);
  }
} 