import { Test, TestingModule } from '@nestjs/testing';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateGoalStatusDto } from './dto/update-goal-status.dto';
import { StatusMeta, TipoMeta } from '@prisma/client';

describe('GoalsController', () => {
  let controller: GoalsController;
  let service: GoalsService;

  const mockGoalsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    createProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [
        {
          provide: GoalsService,
          useValue: mockGoalsService,
        },
      ],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
    service = module.get<GoalsService>(GoalsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new goal', async () => {
      const createGoalDto: CreateGoalDto = {
        titulo: 'Test Goal',
        descricao: 'Test Description',
        tipo: TipoMeta.ACADEMICA,
        especifico: 'Specific',
        mensuravel: 'Measurable',
        atingivel: 'Achievable',
        relevante: 'Relevant',
        temporal: 'Time-bound',
        dataInicio: '2024-03-26',
        dataFim: '2024-06-26',
        status: StatusMeta.NAO_INICIADA,
        intervencaoId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const expectedResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createGoalDto,
        dataInicio: new Date(createGoalDto.dataInicio),
        dataFim: new Date(createGoalDto.dataFim),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockGoalsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createGoalDto);

      expect(result).toEqual(expectedResult);
      expect(mockGoalsService.create).toHaveBeenCalledWith(createGoalDto);
    });
  });

  describe('findAll', () => {
    it('should return all goals', async () => {
      const goals = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          titulo: 'Test Goal',
        },
      ];

      mockGoalsService.findAll.mockResolvedValue(goals);

      const result = await controller.findAll();

      expect(result).toEqual(goals);
      expect(mockGoalsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a goal by id', async () => {
      const goal = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        titulo: 'Test Goal',
      };

      mockGoalsService.findOne.mockResolvedValue(goal);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(goal);
      expect(mockGoalsService.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('update', () => {
    it('should update a goal', async () => {
      const updateGoalDto: UpdateGoalDto = {
        titulo: 'Updated Goal',
        descricao: 'Updated Description',
      };

      const expectedResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...updateGoalDto,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockGoalsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('123e4567-e89b-12d3-a456-426614174000', updateGoalDto);

      expect(result).toEqual(expectedResult);
      expect(mockGoalsService.update).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateGoalDto);
    });
  });

  describe('updateStatus', () => {
    it('should update goal status', async () => {
      const updateStatusDto: UpdateGoalStatusDto = {
        status: StatusMeta.EM_ANDAMENTO,
      };

      const expectedResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: StatusMeta.EM_ANDAMENTO,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockGoalsService.updateStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateStatus('123e4567-e89b-12d3-a456-426614174000', updateStatusDto);

      expect(result).toEqual(expectedResult);
      expect(mockGoalsService.updateStatus).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateStatusDto);
    });
  });

  describe('remove', () => {
    it('should remove a goal', async () => {
      await controller.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockGoalsService.remove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('createProgress', () => {
    it('should create a progress for a goal', async () => {
      const createProgressDto: CreateProgressDto = {
        valor: 75.5,
        observacoes: 'Test Progress',
        metaId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const expectedResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: new Date(),
        valorKpi: createProgressDto.valor,
        observacoes: createProgressDto.observacoes,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockGoalsService.createProgress.mockResolvedValue(expectedResult);

      const result = await controller.createProgress('123e4567-e89b-12d3-a456-426614174000', createProgressDto);

      expect(result).toEqual(expectedResult);
      expect(mockGoalsService.createProgress).toHaveBeenCalledWith(createProgressDto);
    });
  });
}); 