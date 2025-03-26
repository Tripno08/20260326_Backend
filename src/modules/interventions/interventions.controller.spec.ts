import { Test, TestingModule } from '@nestjs/testing';
import { InterventionsController } from './interventions.controller';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { Status, NivelIntervencao, AreaIntervencao } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InterventionsController', () => {
  let controller: InterventionsController;
  let service: InterventionsService;

  const mockInterventionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStudent: jest.fn(),
    findByStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterventionsController],
      providers: [
        {
          provide: InterventionsService,
          useValue: mockInterventionsService,
        },
      ],
    }).compile();

    controller = module.get<InterventionsController>(InterventionsController);
    service = module.get<InterventionsService>(InterventionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should create an intervention', async () => {
      const expectedResult = { id: '1', ...createInterventionDto };
      mockInterventionsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createInterventionDto);

      expect(result).toEqual(expectedResult);
      expect(mockInterventionsService.create).toHaveBeenCalledWith(createInterventionDto);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockInterventionsService.create.mockRejectedValue(new NotFoundException('Estudante não encontrado'));

      await expect(controller.create(createInterventionDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when data is invalid', async () => {
      mockInterventionsService.create.mockRejectedValue(new BadRequestException('Dados inválidos'));

      await expect(controller.create(createInterventionDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of interventions', async () => {
      const expectedResult = [
        { id: '1', tipo: 'COMPORTAMENTAL' },
        { id: '2', tipo: 'ACADEMICO' },
      ];
      mockInterventionsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockInterventionsService.findAll).toHaveBeenCalled();
    });

    it('should filter interventions by status when query parameter is provided', async () => {
      const expectedResult = [
        { id: '1', status: Status.ATIVO },
        { id: '2', status: Status.ATIVO },
      ];
      mockInterventionsService.findByStatus.mockResolvedValue(expectedResult);

      const result = await controller.findAll(Status.ATIVO);

      expect(result).toEqual(expectedResult);
      expect(mockInterventionsService.findByStatus).toHaveBeenCalledWith(Status.ATIVO);
    });
  });

  describe('findOne', () => {
    it('should return an intervention', async () => {
      const expectedResult = { id: '1', tipo: 'COMPORTAMENTAL' };
      mockInterventionsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockInterventionsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when intervention not found', async () => {
      mockInterventionsService.findOne.mockRejectedValue(new NotFoundException('Intervenção não encontrada'));

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateInterventionDto: UpdateInterventionDto = {
      tipo: 'ACADEMICO',
      descricao: 'Intervenção atualizada',
    };

    it('should update an intervention', async () => {
      const expectedResult = { id: '1', ...updateInterventionDto };
      mockInterventionsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateInterventionDto);

      expect(result).toEqual(expectedResult);
      expect(mockInterventionsService.update).toHaveBeenCalledWith('1', updateInterventionDto);
    });

    it('should throw NotFoundException when intervention not found', async () => {
      mockInterventionsService.update.mockRejectedValue(new NotFoundException('Intervenção não encontrada'));

      await expect(controller.update('1', updateInterventionDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when data is invalid', async () => {
      mockInterventionsService.update.mockRejectedValue(new BadRequestException('Dados inválidos'));

      await expect(controller.update('1', updateInterventionDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an intervention', async () => {
      await controller.remove('1');

      expect(mockInterventionsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when intervention not found', async () => {
      mockInterventionsService.remove.mockRejectedValue(new NotFoundException('Intervenção não encontrada'));

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when intervention has associated records', async () => {
      mockInterventionsService.remove.mockRejectedValue(
        new BadRequestException('Não é possível remover a intervenção pois existem registros associados'),
      );

      await expect(controller.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStudent', () => {
    it('should return interventions by student ID', async () => {
      const expectedResult = [
        { id: '1', estudanteId: 'student-1' },
        { id: '2', estudanteId: 'student-1' },
      ];
      mockInterventionsService.findByStudent.mockResolvedValue(expectedResult);

      const result = await controller.findByStudent('student-1');

      expect(result).toEqual(expectedResult);
      expect(mockInterventionsService.findByStudent).toHaveBeenCalledWith('student-1');
    });

    it('should throw NotFoundException when student not found', async () => {
      mockInterventionsService.findByStudent.mockRejectedValue(new NotFoundException('Estudante não encontrado'));

      await expect(controller.findByStudent('student-1')).rejects.toThrow(NotFoundException);
    });
  });
}); 