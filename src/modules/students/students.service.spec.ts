import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEstudanteDto } from './dto/create-student.dto';
import { UpdateEstudanteDto } from './dto/update-student.dto';
import { Estudante } from '@prisma/client';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
    },
    instituicao: {
      findUnique: jest.fn(),
    },
    estudante: {
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
        StudentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEstudanteDto = {
      nome: 'Nome do Estudante',
      serie: '5ª Série',
      dataNascimento: new Date('2010-01-01'),
      usuarioId: 'user-id-1',
      instituicaoId: 'instituicao-id-1',
    };

    it('should create a student successfully', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.instituicao.findUnique.mockResolvedValue({ id: 'inst-1' });
      mockPrismaService.estudante.create.mockResolvedValue({ id: 'student-1', ...createEstudanteDto });

      const result = await service.create(createEstudanteDto);

      expect(result).toHaveProperty('id');
      expect(result.nome).toBe(createEstudanteDto.nome);
      expect(mockPrismaService.estudante.create).toHaveBeenCalledWith({
        data: {
          ...createEstudanteDto,
          dataNascimento: new Date(createEstudanteDto.dataNascimento),
        },
        include: {
          usuario: true,
          Instituicao: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.create(createEstudanteDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if institution not found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.instituicao.findUnique.mockResolvedValue(null);

      await expect(service.create(createEstudanteDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if dataNascimento is invalid', async () => {
      const invalidDto = {
        nome: 'Nome do Estudante',
        serie: '5ª Série',
        dataNascimento: new Date('2010-01-01'),
        usuarioId: 'user-id-1',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      const students = [
        { id: '1', nome: 'Student 1' },
        { id: '2', nome: 'Student 2' },
      ];
      mockPrismaService.estudante.findMany.mockResolvedValue(students);

      const result = await service.findAll();

      expect(result).toEqual(students);
      expect(mockPrismaService.estudante.findMany).toHaveBeenCalledWith({
        include: {
          usuario: true,
          Instituicao: true,
          avaliacoes: true,
          intervencoes: true,
        },
        orderBy: {
          nome: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a student if found', async () => {
      const student = { id: '1', nome: 'Test Student' };
      mockPrismaService.estudante.findUnique.mockResolvedValue(student);

      const result = await service.findOne('1');

      expect(result).toEqual(student);
      expect(mockPrismaService.estudante.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          usuario: true,
          Instituicao: true,
          avaliacoes: true,
          intervencoes: true,
          dificuldades: {
            include: {
              dificuldade: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateEstudanteDto = {
      nome: 'Nome Atualizado',
      serie: '6ª Série',
      dataNascimento: new Date('2010-01-01'),
    };

    it('should update a student successfully', async () => {
      const existingStudent = { id: '1', nome: 'Test Student' };
      mockPrismaService.estudante.findUnique.mockResolvedValue(existingStudent);
      mockPrismaService.instituicao.findUnique.mockResolvedValue({ id: 'inst-2' });
      mockPrismaService.estudante.update.mockResolvedValue({ ...existingStudent, ...updateEstudanteDto });

      const result = await service.update('1', updateEstudanteDto);

      expect(result.nome).toBe(updateEstudanteDto.nome);
      expect(mockPrismaService.estudante.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...updateEstudanteDto,
          dataNascimento: new Date(updateEstudanteDto.dataNascimento),
        },
        include: {
          usuario: true,
          Instituicao: true,
          avaliacoes: true,
          intervencoes: true,
        },
      });
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateEstudanteDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if institution not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.instituicao.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateEstudanteDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if dataNascimento is invalid', async () => {
      const invalidUpdateDto = {
        nome: 'Nome Inválido',
        dataNascimento: new Date('2010-01-01'),
      };
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.update('1', invalidUpdateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a student successfully', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ 
        id: '1',
        avaliacoes: [],
        intervencoes: [],
      });
      mockPrismaService.estudante.delete.mockResolvedValue({ id: '1' });

      await expect(service.remove('1')).resolves.not.toThrow();
      expect(mockPrismaService.estudante.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if student has associated assessments', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ 
        id: '1',
        avaliacoes: [{ id: '1' }],
        intervencoes: [],
      });

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if student has associated interventions', async () => {
      mockPrismaService.estudante.findUnique.mockResolvedValue({ 
        id: '1',
        avaliacoes: [],
        intervencoes: [{ id: '1' }],
      });

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUserId', () => {
    it('should return students by user ID', async () => {
      const students = [
        { id: '1', nome: 'Student 1' },
        { id: '2', nome: 'Student 2' },
      ];
      mockPrismaService.estudante.findMany.mockResolvedValue(students);

      const result = await service.findByUserId('user-1');

      expect(result).toEqual(students);
      expect(mockPrismaService.estudante.findMany).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1' },
        include: {
          usuario: true,
          Instituicao: true,
          avaliacoes: true,
          intervencoes: true,
        },
        orderBy: {
          nome: 'asc',
        },
      });
    });
  });

  describe('findByInstitution', () => {
    it('should return students by institution ID', async () => {
      const students = [
        { id: '1', nome: 'Student 1' },
        { id: '2', nome: 'Student 2' },
      ];
      mockPrismaService.estudante.findMany.mockResolvedValue(students);

      const result = await service.findByInstitution('inst-1');

      expect(result).toEqual(students);
      expect(mockPrismaService.estudante.findMany).toHaveBeenCalledWith({
        where: { instituicaoId: 'inst-1' },
        include: {
          usuario: true,
          Instituicao: true,
          avaliacoes: true,
          intervencoes: true,
        },
        orderBy: {
          nome: 'asc',
        },
      });
    });
  });

  describe('findBySerie', () => {
    it('should return students by serie', async () => {
      const students = [
        { id: '1', nome: 'Student 1', serie: '1º Ano' },
        { id: '2', nome: 'Student 2', serie: '1º Ano' },
      ];
      mockPrismaService.estudante.findMany.mockResolvedValue(students);

      const result = await service.findBySerie('1º Ano');

      expect(result).toEqual(students);
      expect(mockPrismaService.estudante.findMany).toHaveBeenCalledWith({
        where: { serie: '1º Ano' },
        include: {
          usuario: true,
          Instituicao: true,
          avaliacoes: true,
          intervencoes: true,
        },
        orderBy: {
          nome: 'asc',
        },
      });
    });
  });
}); 