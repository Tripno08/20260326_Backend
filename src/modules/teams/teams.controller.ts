import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CargoEquipe } from '@prisma/client';

@ApiTags('Equipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Criar uma nova equipe' })
  @ApiResponse({ status: 201, description: 'Equipe criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as equipes' })
  @ApiResponse({ status: 200, description: 'Lista de equipes retornada com sucesso.' })
  findAll(@Query('ativo') ativo?: boolean) {
    return this.teamsService.findAll(ativo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma equipe por ID' })
  @ApiResponse({ status: 200, description: 'Equipe encontrada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Atualizar uma equipe' })
  @ApiResponse({ status: 200, description: 'Equipe atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Remover uma equipe' })
  @ApiResponse({ status: 200, description: 'Equipe removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada.' })
  @ApiResponse({ status: 400, description: 'Não é possível remover uma equipe com membros ou estudantes.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/members/:usuarioId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Adicionar um membro à equipe' })
  @ApiResponse({ status: 200, description: 'Membro adicionado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Equipe ou usuário não encontrado.' })
  @ApiResponse({ status: 400, description: 'Usuário já é membro da equipe.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  addMember(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
    @Body('cargo') cargo: CargoEquipe,
  ) {
    return this.teamsService.addMember(id, usuarioId, cargo);
  }

  @Delete(':id/members/:usuarioId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Remover um membro da equipe' })
  @ApiResponse({ status: 200, description: 'Membro removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Equipe ou membro não encontrado.' })
  @ApiResponse({ status: 400, description: 'Membro já está inativo.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  removeMember(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.teamsService.removeMember(id, usuarioId);
  }

  @Post(':id/students/:estudanteId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Adicionar um estudante à equipe' })
  @ApiResponse({ status: 200, description: 'Estudante adicionado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Equipe ou estudante não encontrado.' })
  @ApiResponse({ status: 400, description: 'Estudante já está na equipe.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  addStudent(
    @Param('id') id: string,
    @Param('estudanteId') estudanteId: string,
  ) {
    return this.teamsService.addStudent(id, estudanteId);
  }

  @Delete(':id/students/:estudanteId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Remover um estudante da equipe' })
  @ApiResponse({ status: 200, description: 'Estudante removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Equipe ou estudante não encontrado.' })
  @ApiResponse({ status: 400, description: 'Estudante já está inativo.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  removeStudent(
    @Param('id') id: string,
    @Param('estudanteId') estudanteId: string,
  ) {
    return this.teamsService.removeStudent(id, estudanteId);
  }
} 