import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { StatusMeta } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(createGoalDto: CreateGoalDto) {
    const meta = await this.prisma.meta.create({
      data: {
        titulo: createGoalDto.titulo,
        descricao: createGoalDto.descricao,
        tipo: createGoalDto.tipo,
        especifico: createGoalDto.especifico,
        mensuravel: createGoalDto.mensuravel,
        atingivel: createGoalDto.atingivel,
        relevante: createGoalDto.relevante,
        temporal: createGoalDto.temporal,
        dataInicio: new Date(createGoalDto.dataInicio),
        dataFim: new Date(createGoalDto.dataFim),
        status: createGoalDto.status,
        observacoes: createGoalDto.observacoes,
        intervencao: {
          connect: { id: createGoalDto.intervencaoId },
        },
      },
      include: {
        intervencao: true,
      },
    });

    await this.invalidateCache();
    return meta;
  }

  async findAll() {
    const cachedMetas = await this.redis.get('metas');
    if (cachedMetas) {
      return JSON.parse(cachedMetas);
    }

    const metas = await this.prisma.meta.findMany({
      include: {
        intervencao: true,
      },
    });

    await this.redis.set('metas', JSON.stringify(metas), 3600);
    return metas;
  }

  async findOne(id: string) {
    const cachedMeta = await this.redis.get(`meta:${id}`);
    if (cachedMeta) {
      return JSON.parse(cachedMeta);
    }

    const meta = await this.prisma.meta.findUnique({
      where: { id },
      include: {
        intervencao: true,
      },
    });

    if (!meta) {
      throw new NotFoundException(`Meta com ID ${id} não encontrada`);
    }

    await this.redis.set(`meta:${id}`, JSON.stringify(meta), 3600);
    return meta;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto) {
    const meta = await this.prisma.meta.update({
      where: { id },
      data: {
        titulo: updateGoalDto.titulo,
        descricao: updateGoalDto.descricao,
        tipo: updateGoalDto.tipo,
        especifico: updateGoalDto.especifico,
        mensuravel: updateGoalDto.mensuravel,
        atingivel: updateGoalDto.atingivel,
        relevante: updateGoalDto.relevante,
        temporal: updateGoalDto.temporal,
        dataInicio: updateGoalDto.dataInicio ? new Date(updateGoalDto.dataInicio) : undefined,
        dataFim: updateGoalDto.dataFim ? new Date(updateGoalDto.dataFim) : undefined,
        status: updateGoalDto.status,
        observacoes: updateGoalDto.observacoes,
      },
      include: {
        intervencao: true,
      },
    });

    await this.invalidateCache();
    return meta;
  }

  async updateStatus(id: string, status: StatusMeta) {
    const meta = await this.prisma.meta.update({
      where: { id },
      data: { status },
      include: {
        intervencao: true,
      },
    });

    await this.invalidateCache();
    return meta;
  }

  async remove(id: string) {
    await this.prisma.meta.delete({
      where: { id },
    });

    await this.invalidateCache();
  }

  async createProgress(createProgressDto: CreateProgressDto) {
    const meta = await this.prisma.meta.findUnique({
      where: { id: createProgressDto.metaId },
      include: { intervencao: true },
    });

    if (!meta) {
      throw new NotFoundException(`Meta com ID ${createProgressDto.metaId} não encontrada`);
    }

    const progresso = await this.prisma.progressoIntervencao.create({
      data: {
        data: new Date(),
        valorKpi: createProgressDto.valor,
        observacoes: createProgressDto.observacoes,
        intervencao: {
          connect: { id: meta.intervencaoId },
        },
      },
      include: {
        intervencao: true,
      },
    });

    await this.invalidateCache();
    return progresso;
  }

  private async invalidateCache() {
    await this.redis.del('metas');
    const metas = await this.prisma.meta.findMany();
    for (const meta of metas) {
      await this.redis.del(`meta:${meta.id}`);
    }
  }
} 