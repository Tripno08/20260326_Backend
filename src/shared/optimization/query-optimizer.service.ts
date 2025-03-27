import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import DataLoader from 'dataloader';
import { Usuario, Intervencao, Avaliacao, Estudante } from '@prisma/client';

type DataLoaderResult<T> = T | Error;

@Injectable()
export class QueryOptimizerService implements OnModuleInit {
  private estudanteLoader: DataLoader<string, Estudante>;
  private usuarioLoader: DataLoader<string, Usuario>;
  private intervencaoLoader: DataLoader<string, Intervencao[]>;
  private avaliacaoLoader: DataLoader<string, Avaliacao[]>;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.initializeLoaders();
  }

  private initializeLoaders() {
    // Loader para estudantes
    this.estudanteLoader = new DataLoader<string, Estudante>(async (keys: string[]) => {
      const estudantes = await this.prisma.estudante.findMany({
        where: {
          id: { in: keys as string[] },
        },
      });

      const estudanteMap = estudantes.reduce((map, estudante) => {
        map[estudante.id] = estudante;
        return map;
      }, {});

      return keys.map(key => estudanteMap[key] || new Error(`Estudante with ID ${key} not found`));
    });

    // Loader para usuários
    this.usuarioLoader = new DataLoader<string, Usuario>(async (keys: string[]) => {
      const users = await this.prisma.usuario.findMany({
        where: {
          id: { in: keys as string[] },
        },
      });

      const userMap = users.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});

      return keys.map(key => userMap[key] || new Error(`User with ID ${key} not found`));
    });

    // Loader para intervenções por estudante
    this.intervencaoLoader = new DataLoader<string, Intervencao[]>(async (keys: string[]) => {
      const intervencoes = await this.prisma.intervencao.findMany({
        where: {
          estudanteId: { in: keys as string[] },
        },
      });

      const intervencoesPorEstudante = keys.reduce((map, key) => {
        map[key] = intervencoes.filter(i => i.estudanteId === key);
        return map;
      }, {});

      return keys.map(key => intervencoesPorEstudante[key] || []);
    });

    // Loader para avaliações por estudante
    this.avaliacaoLoader = new DataLoader<string, Avaliacao[]>(async (keys: string[]) => {
      const avaliacoes = await this.prisma.avaliacao.findMany({
        where: {
          estudanteId: { in: keys as string[] },
        },
      });

      const avaliacoesPorEstudante = keys.reduce((map, key) => {
        map[key] = avaliacoes.filter(a => a.estudanteId === key);
        return map;
      }, {});

      return keys.map(key => avaliacoesPorEstudante[key] || []);
    });
  }

  async loadEstudante(id: string): Promise<Estudante> {
    return this.estudanteLoader.load(id);
  }

  async loadEstudantes(ids: string[]): Promise<(Estudante | Error)[]> {
    return this.estudanteLoader.loadMany(ids);
  }

  async loadUsuario(id: string): Promise<Usuario> {
    return this.usuarioLoader.load(id);
  }

  async loadUsuarios(ids: string[]): Promise<(Usuario | Error)[]> {
    return this.usuarioLoader.loadMany(ids);
  }

  async loadIntervencoes(estudanteId: string): Promise<Intervencao[]> {
    return this.intervencaoLoader.load(estudanteId);
  }

  async loadIntervencoesMulti(estudanteIds: string[]): Promise<Intervencao[][]> {
    const result = await this.intervencaoLoader.loadMany(estudanteIds);
    return result.map(r => (r instanceof Error ? [] : r));
  }

  async loadAvaliacoes(estudanteId: string): Promise<Avaliacao[]> {
    return this.avaliacaoLoader.load(estudanteId);
  }

  async loadAvaliacoesMulti(estudanteIds: string[]): Promise<Avaliacao[][]> {
    const result = await this.avaliacaoLoader.loadMany(estudanteIds);
    return result.map(r => (r instanceof Error ? [] : r));
  }

  // Método para limpar o cache (útil para testes)
  clearCache() {
    this.estudanteLoader.clearAll();
    this.usuarioLoader.clearAll();
    this.intervencaoLoader.clearAll();
    this.avaliacaoLoader.clearAll();
  }
} 