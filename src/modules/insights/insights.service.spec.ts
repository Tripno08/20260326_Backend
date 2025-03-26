import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TipoInsight, NivelRisco } from './dto/create-insight.dto';

describe('InsightsService', () => {
  let service: InsightsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    insight: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    historicoDados: {
      findMany: jest.fn(),
    },
    avaliacao: {
      findMany: jest.fn(),
    },
    intervencao: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createInsightDto = {
      titulo: 'Teste Insight',
      descricao: 'Descrição do insight',
      tipo: TipoInsight.DESCRITIVO,
      nivelRisco: NivelRisco.BAIXO,
      metricas: [
        {
          nome: 'Métrica 1',
          valor: '10',
          unidade: 'pontos',
        },
      ],
      recomendacoes: [
        {
          descricao: 'Recomendação 1',
          prioridade: '1',
          impacto: 'ALTO',
        },
      ],
    };

    it('should create an insight successfully', async () => {
      const expectedResult = {
        id: '1',
        ...createInsightDto,
        metricas: JSON.stringify(createInsightDto.metricas),
        recomendacoes: JSON.stringify(createInsightDto.recomendacoes),
      };

      mockPrismaService.insight.create.mockResolvedValue(expectedResult);

      const result = await service.create(createInsightDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.insight.create).toHaveBeenCalledWith({
        data: {
          ...createInsightDto,
          metricas: JSON.stringify(createInsightDto.metricas),
          recomendacoes: JSON.stringify(createInsightDto.recomendacoes),
          dadosAdicionais: null,
        },
      });
    });

    it('should throw BadRequestException when metricas is invalid', async () => {
      const invalidDto = {
        ...createInsightDto,
        metricas: [{ nome: 'Métrica 1' }], // Missing valor and unidade
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when recomendacoes is invalid', async () => {
      const invalidDto = {
        ...createInsightDto,
        recomendacoes: [{ descricao: 'Recomendação 1' }], // Missing prioridade and impacto
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all insights', async () => {
      const expectedResult = [
        {
          id: '1',
          titulo: 'Insight 1',
          tipo: TipoInsight.DESCRITIVO,
        },
        {
          id: '2',
          titulo: 'Insight 2',
          tipo: TipoInsight.PREDITIVO,
        },
      ];

      mockPrismaService.insight.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.insight.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          dataAnalise: 'desc',
        },
      });
    });

    it('should filter insights by type and risk level', async () => {
      const filters = {
        tipo: TipoInsight.DESCRITIVO,
        nivelRisco: NivelRisco.ALTO,
      };

      await service.findAll(filters);

      expect(mockPrismaService.insight.findMany).toHaveBeenCalledWith({
        where: filters,
        orderBy: {
          dataAnalise: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return an insight by id', async () => {
      const expectedResult = {
        id: '1',
        titulo: 'Insight 1',
        tipo: TipoInsight.DESCRITIVO,
      };

      mockPrismaService.insight.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.insight.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when insight is not found', async () => {
      mockPrismaService.insight.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateInsightDto = {
      titulo: 'Updated Insight',
      descricao: 'Updated description',
    };

    it('should update an insight successfully', async () => {
      const existingInsight = {
        id: '1',
        titulo: 'Original Insight',
      };

      const expectedResult = {
        id: '1',
        ...updateInsightDto,
      };

      mockPrismaService.insight.findUnique.mockResolvedValue(existingInsight);
      mockPrismaService.insight.update.mockResolvedValue(expectedResult);

      const result = await service.update('1', updateInsightDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.insight.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateInsightDto,
      });
    });

    it('should throw NotFoundException when insight is not found', async () => {
      mockPrismaService.insight.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateInsightDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an insight successfully', async () => {
      const existingInsight = {
        id: '1',
        titulo: 'Insight to remove',
      };

      mockPrismaService.insight.findUnique.mockResolvedValue(existingInsight);
      mockPrismaService.insight.delete.mockResolvedValue(existingInsight);

      await service.remove('1');

      expect(mockPrismaService.insight.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when insight is not found', async () => {
      mockPrismaService.insight.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('gerarInsightPredativo', () => {
    const estudanteId = '1';

    it('should generate predictive insights for a student', async () => {
      const historico = [
        { id: '1', data: new Date(), dados: {} },
      ];

      const avaliacoes = [
        { id: '1', pontuacao: 8, data: new Date() },
        { id: '2', pontuacao: 7, data: new Date() },
      ];

      const intervencoes = [
        { id: '1', status: 'ATIVO', dataInicio: new Date() },
      ];

      mockPrismaService.historicoDados.findMany.mockResolvedValue(historico);
      mockPrismaService.avaliacao.findMany.mockResolvedValue(avaliacoes);
      mockPrismaService.intervencao.findMany.mockResolvedValue(intervencoes);
      mockPrismaService.insight.create.mockResolvedValue({ id: '1' });

      const result = await service.gerarInsightPredativo(estudanteId);

      expect(result).toBeDefined();
      expect(mockPrismaService.historicoDados.findMany).toHaveBeenCalledWith({
        where: { estudanteId },
        orderBy: { data: 'desc' },
      });
      expect(mockPrismaService.avaliacao.findMany).toHaveBeenCalledWith({
        where: { estudanteId },
        orderBy: { data: 'desc' },
      });
      expect(mockPrismaService.intervencao.findMany).toHaveBeenCalledWith({
        where: { estudanteId },
        orderBy: { dataInicio: 'desc' },
      });
    });
  });
}); 