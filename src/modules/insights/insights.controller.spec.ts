import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';
import { TipoInsight, NivelRisco } from './dto/create-insight.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '../auth/enums/role.enum';

describe('InsightsController', () => {
  let controller: InsightsController;
  let service: InsightsService;

  const mockInsightsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    gerarInsightPredativo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        {
          provide: InsightsService,
          useValue: mockInsightsService,
        },
      ],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
    service = module.get<InsightsService>(InsightsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createInsightDto: CreateInsightDto = {
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
      };

      mockInsightsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createInsightDto);

      expect(result).toEqual(expectedResult);
      expect(mockInsightsService.create).toHaveBeenCalledWith(createInsightDto);
    });

    it('should throw BadRequestException when service throws', async () => {
      mockInsightsService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(createInsightDto)).rejects.toThrow(BadRequestException);
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

      mockInsightsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockInsightsService.findAll).toHaveBeenCalledWith({});
    });

    it('should filter insights with query parameters', async () => {
      const queryParams = {
        tipo: TipoInsight.DESCRITIVO,
        nivelRisco: NivelRisco.ALTO,
        dataInicio: new Date(),
        dataFim: new Date(),
      };

      await controller.findAll(
        queryParams.tipo,
        queryParams.nivelRisco,
        queryParams.dataInicio,
        queryParams.dataFim,
      );

      expect(mockInsightsService.findAll).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('findOne', () => {
    it('should return an insight by id', async () => {
      const expectedResult = {
        id: '1',
        titulo: 'Insight 1',
        tipo: TipoInsight.DESCRITIVO,
      };

      mockInsightsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockInsightsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when insight is not found', async () => {
      mockInsightsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateInsightDto: UpdateInsightDto = {
      titulo: 'Updated Insight',
      descricao: 'Updated description',
    };

    it('should update an insight successfully', async () => {
      const expectedResult = {
        id: '1',
        ...updateInsightDto,
      };

      mockInsightsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateInsightDto);

      expect(result).toEqual(expectedResult);
      expect(mockInsightsService.update).toHaveBeenCalledWith('1', updateInsightDto);
    });

    it('should throw NotFoundException when insight is not found', async () => {
      mockInsightsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('1', updateInsightDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when service throws', async () => {
      mockInsightsService.update.mockRejectedValue(new BadRequestException());

      await expect(controller.update('1', updateInsightDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an insight successfully', async () => {
      const expectedResult = {
        id: '1',
        titulo: 'Removed Insight',
      };

      mockInsightsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(mockInsightsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when insight is not found', async () => {
      mockInsightsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('gerarInsightPredativo', () => {
    const estudanteId = '1';

    it('should generate predictive insights for a student', async () => {
      const expectedResult = [
        {
          id: '1',
          titulo: 'Insight Predativo 1',
          tipo: TipoInsight.PREDITIVO,
        },
      ];

      mockInsightsService.gerarInsightPredativo.mockResolvedValue(expectedResult);

      const result = await controller.gerarInsightPredativo(estudanteId);

      expect(result).toEqual(expectedResult);
      expect(mockInsightsService.gerarInsightPredativo).toHaveBeenCalledWith(estudanteId);
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockInsightsService.gerarInsightPredativo.mockRejectedValue(new NotFoundException());

      await expect(controller.gerarInsightPredativo(estudanteId)).rejects.toThrow(NotFoundException);
    });
  });
}); 