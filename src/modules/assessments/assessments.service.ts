import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssessmentDto: CreateAssessmentDto) {
    const { estudanteId } = createAssessmentDto;

    // Verifica se o estudante existe
    const estudante = await this.prisma.estudante.findUnique({
      where: { id: estudanteId }
    });

    if (!estudante) {
      throw new NotFoundException(`Estudante com ID ${estudanteId} não encontrado`);
    }

    return this.prisma.avaliacao.create({
      data: {
        ...createAssessmentDto,
        data: new Date(createAssessmentDto.data)
      },
      include: {
        estudante: true
      }
    });
  }

  async findAll(params?: {
    estudanteId?: string;
    tipo?: string;
    dataInicio?: Date;
    dataFim?: Date;
  }) {
    const where: any = {};

    if (params?.estudanteId) {
      where.estudanteId = params.estudanteId;
    }

    if (params?.tipo) {
      where.tipo = params.tipo;
    }

    if (params?.dataInicio || params?.dataFim) {
      where.data = {};
      if (params.dataInicio) {
        where.data.gte = new Date(params.dataInicio);
      }
      if (params.dataFim) {
        where.data.lte = new Date(params.dataFim);
      }
    }

    return this.prisma.avaliacao.findMany({
      where,
      include: {
        estudante: true
      }
    });
  }

  async findOne(id: string) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id },
      include: {
        estudante: true
      }
    });

    if (!avaliacao) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    return avaliacao;
  }

  async update(id: string, updateAssessmentDto: UpdateAssessmentDto) {
    // Verifica se a avaliação existe
    await this.findOne(id);

    // Se houver estudanteId, verifica se o estudante existe
    if (updateAssessmentDto.estudanteId) {
      const estudante = await this.prisma.estudante.findUnique({
        where: { id: updateAssessmentDto.estudanteId }
      });

      if (!estudante) {
        throw new NotFoundException(
          `Estudante com ID ${updateAssessmentDto.estudanteId} não encontrado`
        );
      }
    }

    return this.prisma.avaliacao.update({
      where: { id },
      data: {
        ...updateAssessmentDto,
        data: updateAssessmentDto.data ? new Date(updateAssessmentDto.data) : undefined
      },
      include: {
        estudante: true
      }
    });
  }

  async remove(id: string) {
    // Verifica se a avaliação existe
    await this.findOne(id);

    return this.prisma.avaliacao.delete({
      where: { id },
      include: {
        estudante: true
      }
    });
  }

  async findByStudent(estudanteId: string) {
    // Verifica se o estudante existe
    const estudante = await this.prisma.estudante.findUnique({
      where: { id: estudanteId }
    });

    if (!estudante) {
      throw new NotFoundException(`Estudante com ID ${estudanteId} não encontrado`);
    }

    return this.prisma.avaliacao.findMany({
      where: { estudanteId },
      include: {
        estudante: true
      }
    });
  }

  async findByStudentId(estudanteId: string) {
    return this.findByStudent(estudanteId);
  }

  async findByType(tipo: string) {
    return this.prisma.avaliacao.findMany({
      where: { tipo },
      include: {
        estudante: true
      }
    });
  }
} 