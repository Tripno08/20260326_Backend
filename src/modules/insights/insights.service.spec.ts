import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateInsightDto, TipoInsight, NivelRisco, MetricaInsightDto, RecomendacaoInsightDto } from './dto/create-insight.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InsightsService', () => {
  let service: InsightsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    insight: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customInsight: {
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
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validMetricas: MetricaInsightDto[] = [
      {
        nome: 'Métrica 1',
        valor: '10',
        unidade: '%',
      },
    ];

    const validRecomendacoes: RecomendacaoInsightDto[] = [
      {
        descricao: 'Recomendação 1',
        prioridade: 'Alta',
        impacto: 'Médio',
      },
    ];

    const createInsightDto: CreateInsightDto = {
      titulo: 'Teste de Insight',
      descricao: 'Descrição do insight de teste',
      tipo: TipoInsight.ACADEMICO,
      nivelRisco: NivelRisco.MEDIO,
      metricas: validMetricas,
      recomendacoes: validRecomendacoes,
    };

    it('should create an insight', async () => {
      const expectedResult = {
        id: 'test-id',
        ...createInsightDto,
        metricas: JSON.stringify(createInsightDto.metricas),
        recomendacoes: JSON.stringify(createInsightDto.recomendacoes),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.insight.create.mockResolvedValue(expectedResult);

      const result = await service.create(createInsightDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.insight.create).toHaveBeenCalledWith({
        data: {
          titulo: createInsightDto.titulo,
          descricao: createInsightDto.descricao,
          tipo: createInsightDto.tipo,
          nivelRisco: createInsightDto.nivelRisco,
          metricas: JSON.stringify(createInsightDto.metricas),
          recomendacoes: JSON.stringify(createInsightDto.recomendacoes),
        },
      });
    });

    it('should throw BadRequestException if metricas is missing', async () => {
      const invalidDto = {
        titulo: 'Teste de Insight',
        descricao: 'Descrição do insight de teste',
        tipo: TipoInsight.ACADEMICO,
        nivelRisco: NivelRisco.MEDIO,
        metricas: [{ nome: 'Métrica incompleta' }] as any,
        recomendacoes: validRecomendacoes,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if recomendacoes is invalid', async () => {
      const invalidDto = {
        titulo: 'Teste de Insight',
        descricao: 'Descrição do insight de teste',
        tipo: TipoInsight.ACADEMICO,
        nivelRisco: NivelRisco.MEDIO,
        metricas: validMetricas,
        recomendacoes: [{ descricao: 'Recomendação incompleta' }] as any,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all insights', async () => {
      const mockInsights = [
        {
          id: 'test-id-1',
          titulo: 'Insight 1',
          descricao: 'Descrição 1',
          tipo: TipoInsight.ACADEMICO,
          nivelRisco: NivelRisco.MEDIO,
          metricas: JSON.stringify([{ nome: 'Métrica 1', valor: '10', unidade: '%' }]),
          recomendacoes: JSON.stringify([{ descricao: 'Recomendação 1', prioridade: 'Alta', impacto: 'Médio' }]),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.customInsight.findMany.mockResolvedValue(mockInsights);

      const result = await service.findAll({});

      expect(result).toEqual(mockInsights);
      expect(mockPrismaService.customInsight.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single insight', async () => {
      const mockInsight = {
        id: 'test-id',
        titulo: 'Insight',
        descricao: 'Descrição',
        tipo: TipoInsight.ACADEMICO,
        nivelRisco: NivelRisco.MEDIO,
        metricas: JSON.stringify([{ nome: 'Métrica 1', valor: '10', unidade: '%' }]),
        recomendacoes: JSON.stringify([{ descricao: 'Recomendação 1', prioridade: 'Alta', impacto: 'Médio' }]),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.insight.findUnique.mockResolvedValue(mockInsight);

      const result = await service.findOne('test-id');

      expect(result.id).toBe('test-id');
      expect(Array.isArray(result.metricas)).toBe(true);
      expect(Array.isArray(result.recomendacoes)).toBe(true);
    });

    it('should throw NotFoundException when insight not found', async () => {
      mockPrismaService.insight.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 