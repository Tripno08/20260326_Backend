import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Estudante } from '@prisma/client';
import { CreateEstudanteDto } from './dto/create-student.dto';
import { UpdateEstudanteDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(createStudentDto: CreateEstudanteDto): Promise<Estudante> {
    // Validar a data de nascimento
    const dataNascimento = new Date(createStudentDto.dataNascimento);
    if (isNaN(dataNascimento.getTime())) {
      throw new BadRequestException('Data de nascimento inválida');
    }

    // Verificar se o usuário existe
    const user = await this.prisma.usuario.findUnique({
      where: { id: createStudentDto.usuarioId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${createStudentDto.usuarioId} não encontrado`);
    }

    // Se tiver instituição, verificar se existe
    if (createStudentDto.instituicaoId) {
      const instituicao = await this.prisma.instituicao.findUnique({
        where: { id: createStudentDto.instituicaoId },
      });

      if (!instituicao) {
        throw new NotFoundException(`Instituição com ID ${createStudentDto.instituicaoId} não encontrada`);
      }
    }

    return this.prisma.estudante.create({
      data: {
        ...createStudentDto,
        dataNascimento,
      },
      include: {
        usuario: true,
        Instituicao: true,
      },
    });
  }

  async findAll(params?: {
    serie?: string;
    instituicaoId?: string;
    search?: string;
  }): Promise<Estudante[]> {
    const where: any = {};

    if (params?.serie) {
      where.serie = params.serie;
    }

    if (params?.instituicaoId) {
      where.instituicaoId = params.instituicaoId;
    }

    if (params?.search) {
      where.OR = [
        { nome: { contains: params.search, mode: 'insensitive' } },
        { serie: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.estudante.findMany({
      where,
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Estudante> {
    const estudante = await this.prisma.estudante.findUnique({
      where: { id },
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
        dificuldades: {
          include: {
            dificuldade: true,
          },
        },
      },
    });

    if (!estudante) {
      throw new NotFoundException(`Estudante com ID ${id} não encontrado`);
    }

    return estudante;
  }

  async update(id: string, updateStudentDto: UpdateEstudanteDto): Promise<Estudante> {
    // Verificar se o estudante existe
    await this.findOne(id);

    // Preparar dados para atualização
    const updateData: any = { ...updateStudentDto };

    // Se estiver atualizando a data de nascimento, validar
    if (updateStudentDto.dataNascimento) {
      const dataNascimento = new Date(updateStudentDto.dataNascimento);
      if (isNaN(dataNascimento.getTime())) {
        throw new BadRequestException('Data de nascimento inválida');
      }
      updateData.dataNascimento = dataNascimento;
    }

    // Se estiver atualizando a instituição, verificar se existe
    if (updateStudentDto.instituicaoId) {
      const instituicao = await this.prisma.instituicao.findUnique({
        where: { id: updateStudentDto.instituicaoId },
      });

      if (!instituicao) {
        throw new NotFoundException(`Instituição com ID ${updateStudentDto.instituicaoId} não encontrada`);
      }
    }

    return this.prisma.estudante.update({
      where: { id },
      data: updateData,
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Verificar se o estudante existe
    await this.findOne(id);

    // Verificar se existem avaliações ou intervenções associadas
    const estudante = await this.prisma.estudante.findUnique({
      where: { id },
      include: {
        avaliacoes: true,
        intervencoes: true,
      },
    });

    if (estudante.avaliacoes.length > 0 || estudante.intervencoes.length > 0) {
      throw new BadRequestException(
        'Não é possível remover o estudante pois existem avaliações ou intervenções associadas',
      );
    }

    await this.prisma.estudante.delete({
      where: { id },
    });
  }

  async findByUsuario(usuarioId: string): Promise<Estudante[]> {
    return this.prisma.estudante.findMany({
      where: { usuarioId },
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findByInstituicao(instituicaoId: string): Promise<Estudante[]> {
    return this.prisma.estudante.findMany({
      where: { instituicaoId },
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findBySerie(serie: string): Promise<Estudante[]> {
    return this.prisma.estudante.findMany({
      where: { serie },
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findByUserId(usuarioId: string): Promise<Estudante[]> {
    return this.prisma.estudante.findMany({
      where: { usuarioId },
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findByInstitution(instituicaoId: string): Promise<Estudante[]> {
    return this.prisma.estudante.findMany({
      where: { instituicaoId },
      include: {
        usuario: true,
        Instituicao: true,
        avaliacoes: true,
        intervencoes: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }
} 