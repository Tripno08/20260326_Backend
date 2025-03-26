import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

describe('AssessmentsService', () => {
  let service: AssessmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    avaliacao: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    estudante: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: any = {
      data: new Date('2024-03-26T10:00:00Z'),
      tipo: 'PROVA_BIMESTRAL',
      pontuacao: 8.5,
      observacoes: 'Teste',
      estudanteId: '1',
    };

    it('should create an assessment', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.avaliacao.create.mockResolvedValue(createDto);

      const result = await service.create(createDto);

      expect(result).toEqual(createDto);
      expect(prisma.estudante.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.avaliacao.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of assessments', async () => {
      const expected = [
        { id: '1', tipo: 'PROVA_BIMESTRAL' },
        { id: '2', tipo: 'TRABALHO' },
      ];
      mockPrismaService.avaliacao.findMany.mockResolvedValue(expected);

      const result = await service.findAll();

      expect(result).toEqual(expected);
      expect(prisma.avaliacao.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an assessment', async () => {
      const expected = { id: '1', tipo: 'PROVA_BIMESTRAL' };
      mockPrismaService.avaliacao.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('1');

      expect(result).toEqual(expected);
      expect(prisma.avaliacao.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { estudante: true },
      });
    });

    it('should throw NotFoundException if assessment not found', async () => {
      mockPrismaService.avaliacao.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      pontuacao: 9.0,
      observacoes: 'Atualizado',
    };

    it('should update an assessment', async () => {
      mockPrismaService.avaliacao.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.avaliacao.update.mockResolvedValue({
        id: '1',
        ...updateDto,
      });

      const result = await service.update('1', updateDto);

      expect(result).toEqual({ id: '1', ...updateDto });
      expect(prisma.avaliacao.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if assessment not found', async () => {
      mockPrismaService.avaliacao.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an assessment', async () => {
      mockPrismaService.avaliacao.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.avaliacao.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(result).toEqual({ id: '1' });
      expect(prisma.avaliacao.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if assessment not found', async () => {
      mockPrismaService.avaliacao.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStudentId', () => {
    it('should return assessments for a student', async () => {
      const expected = [
        { id: '1', tipo: 'PROVA_BIMESTRAL', estudanteId: '1' },
        { id: '2', tipo: 'TRABALHO', estudanteId: '1' },
      ];
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.avaliacao.findMany.mockResolvedValue(expected);

      const result = await service.findByStudentId('1');

      expect(result).toEqual(expected);
      expect(prisma.avaliacao.findMany).toHaveBeenCalledWith({
        where: { estudanteId: '1' },
        include: { estudante: true },
      });
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.findByStudentId('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 