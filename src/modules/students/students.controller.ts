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
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CargoUsuario } from '@prisma/client';

@ApiTags('Estudantes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Criar um novo estudante' })
  @ApiResponse({ status: 201, description: 'Estudante criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os estudantes' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
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
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualizar um estudante' })
  @ApiResponse({ status: 200, description: 'Estudante atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Estudante não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
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
  findByUserId(@Param('usuarioId') usuarioId: string) {
    return this.studentsService.findByUserId(usuarioId);
  }

  @Get('institution/:instituicaoId')
  @ApiOperation({ summary: 'Buscar estudantes por ID da instituição' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Instituição não encontrada.' })
  findByInstitution(@Param('instituicaoId') instituicaoId: string) {
    return this.studentsService.findByInstitution(instituicaoId);
  }

  @Get('serie/:serie')
  @ApiOperation({ summary: 'Buscar estudantes por série' })
  @ApiResponse({ status: 200, description: 'Lista de estudantes retornada com sucesso.' })
  findBySerie(@Param('serie') serie: string) {
    return this.studentsService.findBySerie(serie);
  }
} 