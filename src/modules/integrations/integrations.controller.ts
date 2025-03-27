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
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';

@Controller('integrations')
@ApiTags('Integrações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Criar uma nova integração' })
  @ApiResponse({ status: 201, description: 'Integração criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createIntegrationDto: CreateIntegrationDto) {
    return this.integrationsService.create(createIntegrationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as integrações' })
  @ApiResponse({ status: 200, description: 'Lista de integrações retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiQuery({ name: 'ativo', required: false, description: 'Filtrar por status da integração' })
  findAll(@Query('ativo') ativo?: boolean) {
    return this.integrationsService.findAll(ativo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma integração por ID' })
  @ApiResponse({ status: 200, description: 'Integração encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Integração não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualizar uma integração' })
  @ApiResponse({ status: 200, description: 'Integração atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Integração não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() updateIntegrationDto: UpdateIntegrationDto) {
    return this.integrationsService.update(id, updateIntegrationDto);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover uma integração' })
  @ApiResponse({ status: 200, description: 'Integração removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Integração não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id') id: string) {
    return this.integrationsService.remove(id);
  }

  @Post(':id/authorize')
  @ApiOperation({ summary: 'Iniciar processo de autorização da integração' })
  @ApiResponse({ status: 200, description: 'URL de autorização gerada com sucesso' })
  @ApiResponse({ status: 404, description: 'Integração não encontrada' })
  @ApiResponse({ status: 400, description: 'Integração não está ativa' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  authorize(@Param('id') id: string) {
    return this.integrationsService.authorize(id);
  }

  @Get(':id/callback')
  @ApiOperation({ summary: 'Processar callback de autorização' })
  @ApiResponse({ status: 200, description: 'Callback processado com sucesso' })
  @ApiResponse({ status: 404, description: 'Integração não encontrada' })
  callback(@Param('id') id: string, @Query('code') code: string) {
    return this.integrationsService.callback(id, code);
  }

  @Post(':id/sync')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Iniciar sincronização de dados da integração' })
  @ApiResponse({ status: 200, description: 'Sincronização iniciada com sucesso' })
  @ApiResponse({ status: 404, description: 'Integração não encontrada' })
  @ApiResponse({ status: 400, description: 'Integração não está autorizada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  sync(@Param('id') id: string) {
    return this.integrationsService.sync(id);
  }
} 