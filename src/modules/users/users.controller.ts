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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        nome: { type: 'string' },
        cargo: { type: 'string' },
        avatar: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiQuery({ name: 'cargo', required: false, enum: CargoUsuario, description: 'Filtrar por cargo' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nome ou email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          nome: { type: 'string' },
          cargo: { type: 'string' },
          avatar: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findAll(
    @Query('cargo') cargo?: CargoUsuario,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(cargo, search);
  }

  @Get(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário encontrado com sucesso',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        nome: { type: 'string' },
        cargo: { type: 'string' },
        avatar: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário atualizado com sucesso',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        nome: { type: 'string' },
        cargo: { type: 'string' },
        avatar: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 