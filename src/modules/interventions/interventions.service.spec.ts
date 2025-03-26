import { Test, TestingModule } from '@nestjs/testing';
import { InterventionsService } from './interventions.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { Status, NivelIntervencao, AreaIntervencao } from '@prisma/client';

describe('InterventionsService', () => {
  let service: InterventionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    estudante: {
      findUnique: jest.fn(),
    },
    intervencaoBase: {
      findUnique: jest.fn(),
    },
    intervencao: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterventionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InterventionsService>(InterventionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createInterventionDto: CreateInterventionDto = {
      dataInicio: new Date('2024-03-26'),
      tipo: 'COMPORTAMENTAL',
      descricao: 'Teste de intervenção',
      estudanteId: 'student-1',
      intervencaoBaseId: 'base-1',
      nivel: NivelIntervencao.SELETIVO,
      area: AreaIntervencao.COMPORTAMENTO
    };

    it('should create an intervention successfully', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: 'student-1' });
      mockPrismaService.intervencaoBase.findUnique.mockResolvedValue({ id: 'base-1' });
      mockPrismaService.intervencao.create.mockResolvedValue({ id: 'int-1', ...createInterventionDto });

      const result = await service.create(createInterventionDto);

      expect(result).toHaveProperty('id');
      expect(result.tipo).toBe(createInterventionDto.tipo);
      expect(mockPrismaService.intervencao.create).toHaveBeenCalledWith({
        data: {
          ...createInterventionDto,
          status: Status.ATIVO,
        },
        include: {
          estudante: true,
          intervencaoBase: true,
          metas: true,
          progressos: true,
          sessoes: true,
        },
      });
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.create(createInterventionDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if intervention base not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: 'student-1' });
      mockPrismaService.intervencaoBase.findUnique.mockResolvedValue(null);

      await expect(service.create(createInterventionDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const invalidDto = {
        ...createInterventionDto,
        dataFim: new Date('2024-03-25'),
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of interventions', async () => {
      const interventions = [
        { id: '1', tipo: 'COMPORTAMENTAL' },
        { id: '2', tipo: 'ACADEMICO' },
      ];
      mockPrismaService.intervencao.findMany.mockResolvedValue(interventions);

      const result = await service.findAll();

      expect(result).toEqual(interventions);
      expect(mockPrismaService.intervencao.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('findOne', () => {
    it('should return an intervention if found', async () => {
      const intervention = { id: '1', tipo: 'COMPORTAMENTAL' };
      mockPrismaService.intervencao.findUnique.mockResolvedValue(intervention);

      const result = await service.findOne('1');

      expect(result).toEqual(intervention);
      expect(mockPrismaService.intervencao.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          estudante: true,
          intervencaoBase: true,
          metas: true,
          progressos: true,
          sessoes: true,
        },
      });
    });

    it('should throw NotFoundException if intervention not found', async () => {
      mockPrismaService.intervencao.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateInterventionDto: UpdateInterventionDto = {
      tipo: 'ACADEMICO',
      descricao: 'Intervenção atualizada',
    };

    it('should update an intervention successfully', async () => {
      mockPrismaService.intervencao.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.intervencao.update.mockResolvedValue({ id: '1', ...updateInterventionDto });

      const result = await service.update('1', updateInterventionDto);

      expect(result.tipo).toBe(updateInterventionDto.tipo);
      expect(mockPrismaService.intervencao.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateInterventionDto,
        include: {
          estudante: true,
          intervencaoBase: true,
          metas: true,
          progressos: true,
          sessoes: true,
        },
      });
    });

    it('should throw NotFoundException if intervention not found', async () => {
      mockPrismaService.intervencao.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateInterventionDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      mockPrismaService.intervencao.findUnique.mockResolvedValue({ id: '1' });
      const invalidDto = {
        dataInicio: new Date('2024-03-26'),
        dataFim: new Date('2024-03-25'),
      };

      await expect(service.update('1', invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an intervention successfully', async () => {
      mockPrismaService.intervencao.findUnique.mockResolvedValue({
        id: '1',
        metas: [],
        progressos: [],
        sessoes: [],
      });
      mockPrismaService.intervencao.delete.mockResolvedValue({ id: '1' });

      await expect(service.remove('1')).resolves.not.toThrow();
      expect(mockPrismaService.intervencao.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if intervention not found', async () => {
      mockPrismaService.intervencao.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if intervention has associated records', async () => {
      mockPrismaService.intervencao.findUnique.mockResolvedValue({
        id: '1',
        metas: [{ id: '1' }],
        progressos: [],
        sessoes: [],
      });

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStudent', () => {
    it('should return interventions by student ID', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: 'student-1' });
      const interventions = [
        { id: '1', estudanteId: 'student-1' },
        { id: '2', estudanteId: 'student-1' },
      ];
      mockPrismaService.intervencao.findMany.mockResolvedValue(interventions);

      const result = await service.findByStudent('student-1');

      expect(result).toEqual(interventions);
      expect(mockPrismaService.intervencao.findMany).toHaveBeenCalledWith({
        where: { estudanteId: 'student-1' },
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
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.findByStudent('student-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStatus', () => {
    it('should return interventions by status', async () => {
      const interventions = [
        { id: '1', status: Status.ATIVO },
        { id: '2', status: Status.ATIVO },
      ];
      mockPrismaService.intervencao.findMany.mockResolvedValue(interventions);

      const result = await service.findByStatus(Status.ATIVO);

      expect(result).toEqual(interventions);
      expect(mockPrismaService.intervencao.findMany).toHaveBeenCalledWith({
        where: { status: Status.ATIVO },
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
    });
  });
}); 