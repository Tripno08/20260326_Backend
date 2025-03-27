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
import { StudentsService } from './students.service';
import { CreateEstudanteDto } from './dto/create-student.dto';
import { UpdateEstudanteDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';

@ApiTags('Estudantes')
@Controller('estudantes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EstudantesController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN, CargoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Criar um novo estudante' })
  @ApiResponse({ status: 201, description: 'Estudante criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createStudentDto: CreateEstudanteDto) {
    return this.studentsService.create(createStudentDto);
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
    return this.studentsService.findAll({ serie, instituicaoId, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um estudante por ID' })
  @ApiResponse({ status: 200, description: 'Estudante encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.ADMIN, CargoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Atualizar um estudante' })
  @ApiResponse({ status: 200, description: 'Estudante atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateEstudanteDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover um estudante' })
  @ApiResponse({ status: 200, description: 'Estudante removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Get('user/:usuarioId')
  @ApiOperation({ summary: 'Buscar estudantes por ID do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.studentsService.findByUsuario(usuarioId);
  }

  @Get('institution/:instituicaoId')
  @ApiOperation({ summary: 'Buscar estudantes por ID da instituição' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Instituição não encontrada.' })
  findByInstituicao(@Param('instituicaoId') instituicaoId: string) {
    return this.studentsService.findByInstituicao(instituicaoId);
  }

  @Get('serie/:serie')
  @ApiOperation({ summary: 'Buscar estudantes por série' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  findBySerie(@Param('serie') serie: string) {
    return this.studentsService.findBySerie(serie);
  }
} 