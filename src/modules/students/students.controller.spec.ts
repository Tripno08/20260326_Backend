import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Role } from '../auth/enums/role.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  const mockStudentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByUserId: jest.fn(),
    findByInstitution: jest.fn(),
    findBySerie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createStudentDto: CreateStudentDto = {
      nome: 'Test Student',
      serie: '1º Ano',
      dataNascimento: '2010-01-01',
      usuarioId: 'user-1',
      instituicaoId: 'inst-1',
    };

    it('should create a student', async () => {
      const expectedResult = { id: '1', ...createStudentDto };
      mockStudentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createStudentDto);

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.create).toHaveBeenCalledWith(createStudentDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockStudentsService.create.mockRejectedValue(new NotFoundException('Usuário não encontrado'));

      await expect(controller.create(createStudentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when data is invalid', async () => {
      mockStudentsService.create.mockRejectedValue(new BadRequestException('Dados inválidos'));

      await expect(controller.create(createStudentDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      const expectedResult = [
        { id: '1', nome: 'Student 1' },
        { id: '2', nome: 'Student 2' },
      ];
      mockStudentsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.findAll).toHaveBeenCalled();
    });

    it('should filter students by serie when query parameter is provided', async () => {
      const expectedResult = [
        { id: '1', nome: 'Student 1', serie: '1º Ano' },
        { id: '2', nome: 'Student 2', serie: '1º Ano' },
      ];
      mockStudentsService.findBySerie.mockResolvedValue(expectedResult);

      const result = await controller.findAll('1º Ano');

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.findBySerie).toHaveBeenCalledWith('1º Ano');
    });
  });

  describe('findOne', () => {
    it('should return a student', async () => {
      const expectedResult = { id: '1', nome: 'Test Student' };
      mockStudentsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when student not found', async () => {
      mockStudentsService.findOne.mockRejectedValue(new NotFoundException('Estudante não encontrado'));

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateStudentDto: UpdateStudentDto = {
      nome: 'Updated Name',
      dataNascimento: '2010-01-01',
    };

    it('should update a student', async () => {
      const expectedResult = { id: '1', ...updateStudentDto };
      mockStudentsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateStudentDto);

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.update).toHaveBeenCalledWith('1', updateStudentDto);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockStudentsService.update.mockRejectedValue(new NotFoundException('Estudante não encontrado'));

      await expect(controller.update('1', updateStudentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when data is invalid', async () => {
      mockStudentsService.update.mockRejectedValue(new BadRequestException('Dados inválidos'));

      await expect(controller.update('1', updateStudentDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a student', async () => {
      await controller.remove('1');

      expect(mockStudentsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when student not found', async () => {
      mockStudentsService.remove.mockRejectedValue(new NotFoundException('Estudante não encontrado'));

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when student has associated records', async () => {
      mockStudentsService.remove.mockRejectedValue(
        new BadRequestException('Não é possível remover o estudante pois existem avaliações ou intervenções associadas'),
      );

      await expect(controller.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUserId', () => {
    it('should return students by user ID', async () => {
      const expectedResult = [
        { id: '1', nome: 'Student 1' },
        { id: '2', nome: 'Student 2' },
      ];
      mockStudentsService.findByUserId.mockResolvedValue(expectedResult);

      const result = await controller.findByUserId('user-1');

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockStudentsService.findByUserId.mockRejectedValue(new NotFoundException('Usuário não encontrado'));

      await expect(controller.findByUserId('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByInstitution', () => {
    it('should return students by institution ID', async () => {
      const expectedResult = [
        { id: '1', nome: 'Student 1' },
        { id: '2', nome: 'Student 2' },
      ];
      mockStudentsService.findByInstitution.mockResolvedValue(expectedResult);

      const result = await controller.findByInstitution('inst-1');

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.findByInstitution).toHaveBeenCalledWith('inst-1');
    });

    it('should throw NotFoundException when institution not found', async () => {
      mockStudentsService.findByInstitution.mockRejectedValue(new NotFoundException('Instituição não encontrada'));

      await expect(controller.findByInstitution('inst-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySerie', () => {
    it('should return students by serie', async () => {
      const expectedResult = [
        { id: '1', nome: 'Student 1', serie: '1º Ano' },
        { id: '2', nome: 'Student 2', serie: '1º Ano' },
      ];
      mockStudentsService.findBySerie.mockResolvedValue(expectedResult);

      const result = await controller.findBySerie('1º Ano');

      expect(result).toEqual(expectedResult);
      expect(mockStudentsService.findBySerie).toHaveBeenCalledWith('1º Ano');
    });
  });
}); 