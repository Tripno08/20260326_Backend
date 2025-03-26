import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto, InstitutionType } from './dto/update-institution.dto';
import { Instituicao } from '@prisma/client';

describe('InstitutionsService', () => {
  let service: InstitutionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    instituicao: {
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
        InstitutionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InstitutionsService>(InstitutionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateInstitutionDto = {
      nome: 'Test Institution',
      tipo: InstitutionType.MUNICIPAL,
      endereco: 'Test Address',
      configuracoes: '{}',
      ativo: true,
    };

    it('should create an institution', async () => {
      const expectedResult = { id: '1', ...createDto };
      mockPrismaService.instituicao.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.instituicao.create).toHaveBeenCalledWith({
        data: createDto,
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of institutions', async () => {
      const expectedResult = [
        { id: '1', nome: 'Institution 1' },
        { id: '2', nome: 'Institution 2' },
      ];
      mockPrismaService.instituicao.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.instituicao.findMany).toHaveBeenCalledWith({
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    });
  });

  describe('findActive', () => {
    it('should return active institutions', async () => {
      const expectedResult = [
        { id: '1', nome: 'Institution 1', ativo: true },
        { id: '2', nome: 'Institution 2', ativo: true },
      ];
      mockPrismaService.instituicao.findMany.mockResolvedValue(expectedResult);

      const result = await service.findActive();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.instituicao.findMany).toHaveBeenCalledWith({
        where: { ativo: true },
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    });
  });

  describe('findByType', () => {
    it('should return institutions by type', async () => {
      const tipo = InstitutionType.MUNICIPAL;
      const expectedResult = [
        { id: '1', nome: 'Institution 1', tipo },
        { id: '2', nome: 'Institution 2', tipo },
      ];
      mockPrismaService.instituicao.findMany.mockResolvedValue(expectedResult);

      const result = await service.findByType(tipo);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.instituicao.findMany).toHaveBeenCalledWith({
        where: { tipo },
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return an institution', async () => {
      const id = '1';
      const expectedResult = { id, nome: 'Test Institution' };
      mockPrismaService.instituicao.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.instituicao.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    });

    it('should throw NotFoundException when institution is not found', async () => {
      const id = '1';
      mockPrismaService.instituicao.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `Instituição com ID "${id}" não encontrada`,
      );
    });
  });

  describe('update', () => {
    const id = '1';
    const updateDto: UpdateInstitutionDto = {
      nome: 'Updated Institution',
    };

    it('should update an institution', async () => {
      const expectedResult = { id, ...updateDto };
      mockPrismaService.instituicao.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.instituicao.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    });

    it('should throw NotFoundException when institution is not found', async () => {
      mockPrismaService.instituicao.update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(id, updateDto)).rejects.toThrow(
        `Instituição com ID "${id}" não encontrada`,
      );
    });
  });

  describe('remove', () => {
    const id = '1';

    it('should remove an institution', async () => {
      const expectedResult = { id, nome: 'Test Institution' };
      mockPrismaService.instituicao.delete.mockResolvedValue(expectedResult);

      await service.remove(id);

      expect(mockPrismaService.instituicao.delete).toHaveBeenCalledWith({
        where: { id },
        include: {
          estudantes: true,
          usuarios: true,
        },
      });
    });

    it('should throw NotFoundException when institution is not found', async () => {
      mockPrismaService.instituicao.delete.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      await expect(service.remove(id)).rejects.toThrow(
        `Instituição com ID "${id}" não encontrada`,
      );
    });
  });
}); 