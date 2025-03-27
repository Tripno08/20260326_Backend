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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(CargoUsuario.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários com filtros opcionais' })
  @ApiQuery({ name: 'cargo', required: false, enum: CargoUsuario })
  @ApiQuery({ name: 'search', required: false })
  @Roles(CargoUsuario.ADMIN)
  findAll(
    @Query('cargo') cargo?: CargoUsuario,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(cargo, search);
  }

  @Get(':id')
  @Roles(CargoUsuario.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(CargoUsuario.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(CargoUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 