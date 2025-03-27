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
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto, InstitutionType } from './dto/update-institution.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';

@ApiTags('institutions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Criar uma nova instituição' })
  @ApiResponse({ status: 201, description: 'Instituição criada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso proibido.' })
  create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionsService.create(createInstitutionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as instituições' })
  @ApiResponse({ status: 200, description: 'Lista de instituições retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.institutionsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar todas as instituições ativas' })
  @ApiResponse({ status: 200, description: 'Lista de instituições ativas retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findActive() {
    return this.institutionsService.findActive();
  }

  @Get('type/:tipo')
  @ApiOperation({ summary: 'Listar instituições por tipo' })
  @ApiResponse({ status: 200, description: 'Lista de instituições retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findByType(@Param('tipo') tipo: InstitutionType) {
    return this.institutionsService.findByType(tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma instituição pelo ID' })
  @ApiResponse({ status: 200, description: 'Instituição encontrada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Instituição não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualizar uma instituição' })
  @ApiResponse({ status: 200, description: 'Instituição atualizada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso proibido.' })
  @ApiResponse({ status: 404, description: 'Instituição não encontrada.' })
  update(@Param('id') id: string, @Body() updateInstitutionDto: UpdateInstitutionDto) {
    return this.institutionsService.update(id, updateInstitutionDto);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover uma instituição' })
  @ApiResponse({ status: 200, description: 'Instituição removida com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso proibido.' })
  @ApiResponse({ status: 404, description: 'Instituição não encontrada.' })
  remove(@Param('id') id: string) {
    return this.institutionsService.remove(id);
  }
} 