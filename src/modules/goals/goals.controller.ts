import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateGoalStatusDto } from './dto/update-goal-status.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '@prisma/client';

@ApiTags('Metas')
@Controller('metas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @Roles(CargoUsuario.PROFESSOR, CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Criar uma nova meta' })
  @ApiResponse({ status: 201, description: 'Meta criada com sucesso' })
  create(@Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as metas' })
  @ApiResponse({ status: 200, description: 'Lista de metas retornada com sucesso' })
  findAll() {
    return this.goalsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma meta específica' })
  @ApiResponse({ status: 200, description: 'Meta encontrada com sucesso' })
  findOne(@Param('id') id: string) {
    return this.goalsService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.PROFESSOR, CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualizar uma meta' })
  @ApiResponse({ status: 200, description: 'Meta atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto) {
    return this.goalsService.update(id, updateGoalDto);
  }

  @Patch(':id/status')
  @Roles(CargoUsuario.PROFESSOR, CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualizar o status de uma meta' })
  @ApiResponse({ status: 200, description: 'Status da meta atualizado com sucesso' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateGoalStatusDto: UpdateGoalStatusDto,
  ) {
    return this.goalsService.updateStatus(id, updateGoalStatusDto.status);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover uma meta' })
  @ApiResponse({ status: 200, description: 'Meta removida com sucesso' })
  remove(@Param('id') id: string) {
    return this.goalsService.remove(id);
  }

  @Post(':id/progresso')
  @Roles(CargoUsuario.PROFESSOR, CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Registrar progresso de uma meta' })
  @ApiResponse({ status: 201, description: 'Progresso registrado com sucesso' })
  createProgress(
    @Param('id') id: string,
    @Body() createProgressDto: CreateProgressDto,
  ) {
    return this.goalsService.createProgress(createProgressDto);
  }
} 