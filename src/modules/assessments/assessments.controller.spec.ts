import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { NotFoundException } from '@nestjs/common';

describe('AssessmentsController', () => {
  let controller: AssessmentsController;
  let service: AssessmentsService;

  const mockAssessmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStudent: jest.fn(),
    findByType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentsController],
      providers: [
        {
          provide: AssessmentsService,
          useValue: mockAssessmentsService,
        },
      ],
    }).compile();

    controller = module.get<AssessmentsController>(AssessmentsController);
    service = module.get<AssessmentsService>(AssessmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an assessment', async () => {
      const createDto: CreateAssessmentDto = {
        data: new Date('2024-03-26T10:00:00Z'),
        tipo: 'ENTREVISTA',
        pontuacao: 8.5,
        observacoes: 'Bom desempenho',
        metadados: { key: 'value' },
        estudanteId: '1'
      };

      const expectedResult = { id: '1', ...createDto };
      mockAssessmentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of assessments', async () => {
      const expectedResult = [
        { id: '1', data: new Date(), tipo: 'ENTREVISTA', pontuacao: 8.5 },
        { id: '2', data: new Date(), tipo: 'TESTE', pontuacao: 7.0 },
      ];
      mockAssessmentsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single assessment', async () => {
      const id = '1';
      const expectedResult = { 
        id, 
        data: new Date(), 
        tipo: 'ENTREVISTA', 
        pontuacao: 8.5 
      };
      mockAssessmentsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when assessment not found', async () => {
      const id = '999';
      mockAssessmentsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an assessment', async () => {
      const id = '1';
      const updateDto: UpdateAssessmentDto = {
        data: new Date('2024-03-26T10:00:00Z'),
        tipo: 'TESTE',
        pontuacao: 9.0,
        observacoes: 'Excelente desempenho',
        metadados: { key: 'updated' },
        estudanteId: '2'
      };

      const expectedResult = { id, ...updateDto };
      mockAssessmentsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('should throw NotFoundException when assessment not found', async () => {
      const id = '999';
      const updateDto: UpdateAssessmentDto = { pontuacao: 9.0 };
      mockAssessmentsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an assessment', async () => {
      const id = '1';
      mockAssessmentsService.remove.mockResolvedValue({ id });

      const result = await controller.remove(id);
      expect(result).toEqual({ id });
      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when assessment not found', async () => {
      const id = '999';
      mockAssessmentsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStudent', () => {
    it('should return assessments for a student', async () => {
      const estudanteId = '1';
      const expectedResult = [
        { id: '1', data: new Date(), tipo: 'ENTREVISTA', pontuacao: 8.5 },
        { id: '2', data: new Date(), tipo: 'TESTE', pontuacao: 7.0 },
      ];
      mockAssessmentsService.findByStudent.mockResolvedValue(expectedResult);

      const result = await controller.findByStudent(estudanteId);
      expect(result).toEqual(expectedResult);
      expect(service.findByStudent).toHaveBeenCalledWith(estudanteId);
    });

    it('should throw NotFoundException when student not found', async () => {
      const estudanteId = '999';
      mockAssessmentsService.findByStudent.mockRejectedValue(new NotFoundException());

      await expect(controller.findByStudent(estudanteId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByType', () => {
    it('should return assessments by type', async () => {
      const tipo = 'ENTREVISTA';
      const expectedResult = [
        { id: '1', data: new Date(), tipo: 'ENTREVISTA', pontuacao: 8.5 },
        { id: '2', data: new Date(), tipo: 'ENTREVISTA', pontuacao: 7.0 },
      ];
      mockAssessmentsService.findByType.mockResolvedValue(expectedResult);

      const result = await controller.findByType(tipo);
      expect(result).toEqual(expectedResult);
      expect(service.findByType).toHaveBeenCalledWith(tipo);
    });
  });
}); 