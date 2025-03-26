import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto, InstitutionType } from './dto/update-institution.dto';
import { Instituicao } from '@prisma/client';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstitutionDto: CreateInstitutionDto): Promise<Instituicao> {
    return this.prisma.instituicao.create({
      data: {
        nome: createInstitutionDto.nome,
        tipo: createInstitutionDto.tipo,
        endereco: createInstitutionDto.endereco,
        configuracoes: createInstitutionDto.configuracoes,
        ativo: createInstitutionDto.ativo ?? true,
      },
      include: {
        estudantes: true,
        usuarios: true,
      },
    });
  }

  async findAll(): Promise<Instituicao[]> {
    return this.prisma.instituicao.findMany({
      include: {
        estudantes: true,
        usuarios: true,
      },
    });
  }

  async findOne(id: string): Promise<Instituicao> {
    const institution = await this.prisma.instituicao.findUnique({
      where: { id },
      include: {
        estudantes: true,
        usuarios: true,
      },
    });

    if (!institution) {
      throw new NotFoundException(`Instituição com ID "${id}" não encontrada`);
    }

    return institution;
  }

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto): Promise<Instituicao> {
    try {
      return await this.prisma.instituicao.update({
        where: { id },
        data: {
          nome: updateInstitutionDto.nome,
          tipo: updateInstitutionDto.tipo,
          endereco: updateInstitutionDto.endereco,
          configuracoes: updateInstitutionDto.configuracoes,
          ativo: updateInstitutionDto.ativo,
        },
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Instituição com ID "${id}" não encontrada`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.instituicao.delete({
        where: { id },
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Instituição com ID "${id}" não encontrada`);
      }
      throw error;
    }
  }

  async findByType(tipo: InstitutionType): Promise<Instituicao[]> {
    return this.prisma.instituicao.findMany({
      where: {
        tipo,
      },
      include: {
        estudantes: true,
        usuarios: true,
      },
    });
  }

  async findActive(): Promise<Instituicao[]> {
    return this.prisma.instituicao.findMany({
      where: {
        ativo: true,
      },
      include: {
        estudantes: true,
        usuarios: true,
      },
    });
  }
} 