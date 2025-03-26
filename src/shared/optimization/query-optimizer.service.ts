import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import DataLoader from 'dataloader';
import { Estudante, Usuario, Intervencao, Avaliacao } from '@prisma/client';

@Injectable()
export class QueryOptimizerService implements OnModuleInit {
  private estudanteLoader: DataLoader<string, Estudante>;
  private usuarioLoader: DataLoader<string, Usuario>;
  private intervencaoLoader: DataLoader<string, Intervencao[]>;
  private avaliacaoLoader: DataLoader<string, Avaliacao[]>;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.estudanteLoader = new DataLoader(async (ids: string[]) => {
      const estudantes = await this.prisma.estudante.findMany({
        where: { id: { in: ids } },
      });
      return ids.map(id => estudantes.find(e => e.id === id));
    });

    this.usuarioLoader = new DataLoader(async (ids: string[]) => {
      const usuarios = await this.prisma.usuario.findMany({
        where: { id: { in: ids } },
      });
      return ids.map(id => usuarios.find(u => u.id === id));
    });

    this.intervencaoLoader = new DataLoader(async (estudanteIds: string[]) => {
      const intervencoes = await this.prisma.intervencao.findMany({
        where: { estudanteId: { in: estudanteIds } },
      });
      return estudanteIds.map(id => 
        intervencoes.filter(i => i.estudanteId === id)
      );
    });

    this.avaliacaoLoader = new DataLoader(async (estudanteIds: string[]) => {
      const avaliacoes = await this.prisma.avaliacao.findMany({
        where: { estudanteId: { in: estudanteIds } },
      });
      return estudanteIds.map(id => 
        avaliacoes.filter(a => a.estudanteId === id)
      );
    });
  }

  async loadEstudante(id: string): Promise<Estudante> {
    return this.estudanteLoader.load(id);
  }

  async loadUsuario(id: string): Promise<Usuario> {
    return this.usuarioLoader.load(id);
  }

  async loadIntervencoes(estudanteId: string): Promise<Intervencao[]> {
    return this.intervencaoLoader.load(estudanteId);
  }

  async loadAvaliacoes(estudanteId: string): Promise<Avaliacao[]> {
    return this.avaliacaoLoader.load(estudanteId);
  }

  async loadEstudantes(ids: string[]): Promise<Estudante[]> {
    return this.estudanteLoader.loadMany(ids);
  }

  async loadUsuarios(ids: string[]): Promise<Usuario[]> {
    return this.usuarioLoader.loadMany(ids);
  }

  async loadIntervencoesPorEstudantes(estudanteIds: string[]): Promise<Intervencao[][]> {
    return this.intervencaoLoader.loadMany(estudanteIds);
  }

  async loadAvaliacoesPorEstudantes(estudanteIds: string[]): Promise<Avaliacao[][]> {
    return this.avaliacaoLoader.loadMany(estudanteIds);
  }
} 