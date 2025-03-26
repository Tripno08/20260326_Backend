import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { StatusMeta, TipoMeta } from '@prisma/client';

describe('GoalsService', () => {
  let service: GoalsService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockPrismaService = {
    meta: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    progressoIntervencao: {
      create: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockPrismaService.meta.create.mockResolvedValue(expectedResult);

      const result = await service.create(createGoalDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.meta.create).toHaveBeenCalledWith({
        data: {
          ...createGoalDto,
          dataInicio: new Date(createGoalDto.dataInicio),
          dataFim: new Date(createGoalDto.dataFim),
          intervencao: {
            connect: { id: createGoalDto.intervencaoId },
          },
        },
        include: {
          intervencao: true,
        },
      });
      expect(mockRedisService.del).toHaveBeenCalledWith('metas');
    });
  });

  describe('findAll', () => {
    it('should return all goals from cache if available', async () => {
      const cachedGoals = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          titulo: 'Test Goal',
        },
      ];

      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedGoals));

      const result = await service.findAll();

      expect(result).toEqual(cachedGoals);
      expect(mockRedisService.get).toHaveBeenCalledWith('metas');
      expect(mockPrismaService.meta.findMany).not.toHaveBeenCalled();
    });

    it('should return all goals from database if not in cache', async () => {
      const goals = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          titulo: 'Test Goal',
        },
      ];

      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.meta.findMany.mockResolvedValue(goals);

      const result = await service.findAll();

      expect(result).toEqual(goals);
      expect(mockRedisService.get).toHaveBeenCalledWith('metas');
      expect(mockPrismaService.meta.findMany).toHaveBeenCalledWith({
        include: {
          intervencao: true,
        },
      });
      expect(mockRedisService.set).toHaveBeenCalledWith('metas', JSON.stringify(goals), 3600);
    });
  });

  describe('findOne', () => {
    it('should return a goal from cache if available', async () => {
      const cachedGoal = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        titulo: 'Test Goal',
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedGoal));

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(cachedGoal);
      expect(mockRedisService.get).toHaveBeenCalledWith('meta:123e4567-e89b-12d3-a456-426614174000');
      expect(mockPrismaService.meta.findUnique).not.toHaveBeenCalled();
    });

    it('should return a goal from database if not in cache', async () => {
      const goal = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        titulo: 'Test Goal',
      };

      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.meta.findUnique.mockResolvedValue(goal);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(goal);
      expect(mockRedisService.get).toHaveBeenCalledWith('meta:123e4567-e89b-12d3-a456-426614174000');
      expect(mockPrismaService.meta.findUnique).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        include: {
          intervencao: true,
        },
      });
      expect(mockRedisService.set).toHaveBeenCalledWith('meta:123e4567-e89b-12d3-a456-426614174000', JSON.stringify(goal), 3600);
    });

    it('should throw NotFoundException if goal not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.meta.findUnique.mockResolvedValue(null);

      await expect(service.findOne('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow('Meta com ID 123e4567-e89b-12d3-a456-426614174000 não encontrada');
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

      mockPrismaService.meta.update.mockResolvedValue(expectedResult);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateGoalDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.meta.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: updateGoalDto,
        include: {
          intervencao: true,
        },
      });
      expect(mockRedisService.del).toHaveBeenCalledWith('metas');
      expect(mockRedisService.del).toHaveBeenCalledWith('meta:123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('updateStatus', () => {
    it('should update goal status', async () => {
      const expectedResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: StatusMeta.EM_ANDAMENTO,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockPrismaService.meta.update.mockResolvedValue(expectedResult);

      const result = await service.updateStatus('123e4567-e89b-12d3-a456-426614174000', StatusMeta.EM_ANDAMENTO);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.meta.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: { status: StatusMeta.EM_ANDAMENTO },
        include: {
          intervencao: true,
        },
      });
      expect(mockRedisService.del).toHaveBeenCalledWith('metas');
      expect(mockRedisService.del).toHaveBeenCalledWith('meta:123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('remove', () => {
    it('should remove a goal', async () => {
      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockPrismaService.meta.delete).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      expect(mockRedisService.del).toHaveBeenCalledWith('metas');
      expect(mockRedisService.del).toHaveBeenCalledWith('meta:123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('createProgress', () => {
    it('should create a progress for a goal', async () => {
      const createProgressDto: CreateProgressDto = {
        valor: 75.5,
        observacoes: 'Test Progress',
        metaId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const meta = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        intervencaoId: '987fcdeb-a51d-12d3-a456-426614174000',
      };

      const expectedResult = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        data: new Date(),
        valorKpi: createProgressDto.valor,
        observacoes: createProgressDto.observacoes,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockPrismaService.meta.findUnique.mockResolvedValue(meta);
      mockPrismaService.progressoIntervencao.create.mockResolvedValue(expectedResult);

      const result = await service.createProgress(createProgressDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.meta.findUnique).toHaveBeenCalledWith({
        where: { id: createProgressDto.metaId },
        include: { intervencao: true },
      });
      expect(mockPrismaService.progressoIntervencao.create).toHaveBeenCalledWith({
        data: {
          data: expect.any(Date),
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
      expect(mockRedisService.del).toHaveBeenCalledWith('metas');
      expect(mockRedisService.del).toHaveBeenCalledWith('meta:123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw NotFoundException if goal not found', async () => {
      const createProgressDto: CreateProgressDto = {
        valor: 75.5,
        observacoes: 'Test Progress',
        metaId: '123e4567-e89b-12d3-a456-426614174000',
      };

      mockPrismaService.meta.findUnique.mockResolvedValue(null);

      await expect(service.createProgress(createProgressDto)).rejects.toThrow('Meta com ID 123e4567-e89b-12d3-a456-426614174000 não encontrada');
    });
  });
}); 