import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Equipe, CargoEquipe } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto): Promise<Equipe> {
    return this.prisma.equipe.create({
      data: {
        ...createTeamDto,
        ativo: createTeamDto.ativo ?? true,
      },
      include: {
        membros: {
          include: {
            usuario: true,
          },
        },
        estudantes: {
          include: {
            estudante: true,
          },
        },
      },
    });
  }

  async findAll(ativo?: boolean): Promise<Equipe[]> {
    return this.prisma.equipe.findMany({
      where: ativo !== undefined ? { ativo } : undefined,
      include: {
        membros: {
          include: {
            usuario: true,
          },
        },
        estudantes: {
          include: {
            estudante: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Equipe> {
    const equipe = await this.prisma.equipe.findUnique({
      where: { id },
      include: {
        membros: {
          include: {
            usuario: true,
          },
        },
        estudantes: {
          include: {
            estudante: true,
          },
        },
      },
    });

    if (!equipe) {
      throw new NotFoundException(`Equipe com ID ${id} não encontrada`);
    }

    return equipe;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Equipe> {
    // Verificar se a equipe existe
    await this.findOne(id);

    return this.prisma.equipe.update({
      where: { id },
      data: updateTeamDto,
      include: {
        membros: {
          include: {
            usuario: true,
          },
        },
        estudantes: {
          include: {
            estudante: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Verificar se a equipe existe
    await this.findOne(id);

    // Verificar se existem registros relacionados
    const equipe = await this.prisma.equipe.findUnique({
      where: { id },
      include: {
        membros: true,
        estudantes: true,
        encaminhamentos: true,
        reunioes: true,
      },
    });

    if (
      equipe.membros.length > 0 ||
      equipe.estudantes.length > 0 ||
      equipe.encaminhamentos.length > 0 ||
      equipe.reunioes.length > 0
    ) {
      throw new BadRequestException(
        'Não é possível remover a equipe pois existem membros, estudantes, encaminhamentos ou reuniões associados',
      );
    }

    await this.prisma.equipe.delete({
      where: { id },
    });
  }

  async addMember(equipeId: string, usuarioId: string, cargo: CargoEquipe): Promise<void> {
    // Verificar se a equipe existe
    await this.findOne(equipeId);

    // Verificar se o usuário existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${usuarioId} não encontrado`);
    }

    // Verificar se o usuário já é membro da equipe
    const membroExistente = await this.prisma.membroEquipe.findFirst({
      where: {
        equipeId,
        usuarioId,
        ativo: true,
      },
    });

    if (membroExistente) {
      throw new BadRequestException('O usuário já é membro desta equipe');
    }

    await this.prisma.membroEquipe.create({
      data: {
        equipeId,
        usuarioId,
        cargo,
        ativo: true,
      },
    });
  }

  async removeMember(equipeId: string, usuarioId: string): Promise<void> {
    // Verificar se a equipe existe
    await this.findOne(equipeId);

    // Verificar se o membro existe e está ativo
    const membro = await this.prisma.membroEquipe.findFirst({
      where: {
        equipeId,
        usuarioId,
        ativo: true,
      },
    });

    if (!membro) {
      throw new NotFoundException('Membro não encontrado ou já removido da equipe');
    }

    await this.prisma.membroEquipe.update({
      where: { id: membro.id },
      data: {
        ativo: false,
        dataSaida: new Date(),
      },
    });
  }

  async addStudent(equipeId: string, estudanteId: string): Promise<void> {
    // Verificar se a equipe existe
    await this.findOne(equipeId);

    // Verificar se o estudante existe
    const estudante = await this.prisma.estudante.findUnique({
      where: { id: estudanteId },
    });

    if (!estudante) {
      throw new NotFoundException(`Estudante com ID ${estudanteId} não encontrado`);
    }

    // Verificar se o estudante já está na equipe
    const estudanteExistente = await this.prisma.estudanteEquipe.findFirst({
      where: {
        equipeId,
        estudanteId,
        ativo: true,
      },
    });

    if (estudanteExistente) {
      throw new BadRequestException('O estudante já está nesta equipe');
    }

    await this.prisma.estudanteEquipe.create({
      data: {
        equipeId,
        estudanteId,
        ativo: true,
      },
    });
  }

  async removeStudent(equipeId: string, estudanteId: string): Promise<void> {
    // Verificar se a equipe existe
    await this.findOne(equipeId);

    // Verificar se o estudante está na equipe e está ativo
    const estudanteEquipe = await this.prisma.estudanteEquipe.findFirst({
      where: {
        equipeId,
        estudanteId,
        ativo: true,
      },
    });

    if (!estudanteEquipe) {
      throw new NotFoundException('Estudante não encontrado ou já removido da equipe');
    }

    await this.prisma.estudanteEquipe.update({
      where: { id: estudanteEquipe.id },
      data: {
        ativo: false,
        dataRemocao: new Date(),
      },
    });
  }
} 