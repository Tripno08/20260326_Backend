import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { Intervencao, Status } from '@prisma/client';

@Injectable()
export class InterventionsService {
  constructor(private prisma: PrismaService) {}

  async create(createInterventionDto: CreateInterventionDto): Promise<Intervencao> {
    // Verificar se o estudante existe
    const estudante = await this.prisma.estudante.findUnique({
      where: { id: createInterventionDto.estudanteId },
    });

    if (!estudante) {
      throw new NotFoundException(`Estudante com ID ${createInterventionDto.estudanteId} não encontrado`);
    }

    // Se houver intervencaoBaseId, verificar se existe
    if (createInterventionDto.intervencaoBaseId) {
      const intervencaoBase = await this.prisma.intervencaoBase.findUnique({
        where: { id: createInterventionDto.intervencaoBaseId },
      });

      if (!intervencaoBase) {
        throw new NotFoundException(
          `Intervenção base com ID ${createInterventionDto.intervencaoBaseId} não encontrada`,
        );
      }
    }

    // Validar datas
    if (createInterventionDto.dataFim && createInterventionDto.dataInicio > createInterventionDto.dataFim) {
      throw new BadRequestException('A data de fim deve ser posterior à data de início');
    }

    return this.prisma.intervencao.create({
      data: {
        ...createInterventionDto,
        status: createInterventionDto.status || Status.ATIVO,
      },
      include: {
        estudante: true,
        intervencaoBase: true,
        metas: true,
        progressos: true,
        sessoes: true,
      },
    });
  }

  async findAll(params?: {
    estudanteId?: string;
    status?: Status;
    tipo?: string;
  }): Promise<Intervencao[]> {
    const where: any = {};

    if (params?.estudanteId) {
      where.estudanteId = params.estudanteId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.tipo) {
      where.tipo = params.tipo;
    }

    return this.prisma.intervencao.findMany({
      where,
      include: {
        estudante: true,
        intervencaoBase: true,
        metas: true,
        progressos: true,
        sessoes: true,
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Intervencao> {
    const intervencao = await this.prisma.intervencao.findUnique({
      where: { id },
      include: {
        estudante: true,
        intervencaoBase: true,
        metas: true,
        progressos: true,
        sessoes: true,
      },
    });

    if (!intervencao) {
      throw new NotFoundException(`Intervenção com ID ${id} não encontrada`);
    }

    return intervencao;
  }

  async update(id: string, updateInterventionDto: UpdateInterventionDto): Promise<Intervencao> {
    // Verificar se a intervenção existe
    await this.findOne(id);

    // Se houver intervencaoBaseId, verificar se existe
    if (updateInterventionDto.intervencaoBaseId) {
      const intervencaoBase = await this.prisma.intervencaoBase.findUnique({
        where: { id: updateInterventionDto.intervencaoBaseId },
      });

      if (!intervencaoBase) {
        throw new NotFoundException(
          `Intervenção base com ID ${updateInterventionDto.intervencaoBaseId} não encontrada`,
        );
      }
    }

    // Validar datas se ambas estiverem presentes
    if (updateInterventionDto.dataFim && updateInterventionDto.dataInicio) {
      if (updateInterventionDto.dataInicio > updateInterventionDto.dataFim) {
        throw new BadRequestException('A data de fim deve ser posterior à data de início');
      }
    }

    return this.prisma.intervencao.update({
      where: { id },
      data: updateInterventionDto,
      include: {
        estudante: true,
        intervencaoBase: true,
        metas: true,
        progressos: true,
        sessoes: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Verificar se a intervenção existe
    await this.findOne(id);

    // Verificar se existem registros relacionados
    const intervencao = await this.prisma.intervencao.findUnique({
      where: { id },
      include: {
        metas: true,
        progressos: true,
        sessoes: true,
      },
    });

    if (
      intervencao.metas.length > 0 ||
      intervencao.progressos.length > 0 ||
      intervencao.sessoes.length > 0
    ) {
      throw new BadRequestException(
        'Não é possível remover a intervenção pois existem metas, progressos ou sessões associadas',
      );
    }

    await this.prisma.intervencao.delete({
      where: { id },
    });
  }

  async findByStudent(estudanteId: string): Promise<Intervencao[]> {
    // Verificar se o estudante existe
    const estudante = await this.prisma.estudante.findUnique({
      where: { id: estudanteId },
    });

    if (!estudante) {
      throw new NotFoundException(`Estudante com ID ${estudanteId} não encontrado`);
    }

    return this.prisma.intervencao.findMany({
      where: { estudanteId },
      include: {
        estudante: true,
        intervencaoBase: true,
        metas: true,
        progressos: true,
        sessoes: true,
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });
  }

  async findByStatus(status: Status): Promise<Intervencao[]> {
    return this.prisma.intervencao.findMany({
      where: { status },
      include: {
        estudante: true,
        intervencaoBase: true,
        metas: true,
        progressos: true,
        sessoes: true,
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });
  }

  async findByType(tipo: string): Promise<Intervencao[]> {
    return this.prisma.intervencao.findMany({
      where: { tipo },
      include: {
        estudante: true,
        intervencaoBase: true,
        metas: true,
        progressos: true,
        sessoes: true,
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });
  }
} 