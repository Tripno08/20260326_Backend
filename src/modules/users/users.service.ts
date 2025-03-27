import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Usuario } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<Usuario> {
    // Verificar se já existe um usuário com o mesmo email
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);

    // Criar o usuário
    return this.prisma.usuario.create({
      data: {
        ...createUserDto,
        senha: hashedPassword,
      },
    });
  }

  async findAll(cargo?: CargoUsuario, search?: string): Promise<Partial<Usuario>[]> {
    const where: Record<string, any> = {};

    if (cargo) {
      where.cargo = cargo.toString();
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
  }

  async findOne(id: string): Promise<Usuario> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<Usuario> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Usuario> {
    // Verificar se o usuário existe
    await this.findOne(id);

    // Se estiver atualizando o email, verificar se já está em uso
    if (updateUserDto.email) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Se estiver atualizando a senha, fazer o hash
    let data = { ...updateUserDto };
    if (updateUserDto.senha) {
      data.senha = await bcrypt.hash(updateUserDto.senha, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    // Verificar se o usuário existe
    await this.findOne(id);

    await this.prisma.usuario.delete({
      where: { id },
    });
  }
} 