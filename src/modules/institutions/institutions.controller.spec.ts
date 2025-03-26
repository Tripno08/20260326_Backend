import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto, InstitutionType } from './dto/update-institution.dto';

describe('InstitutionsController', () => {
  let controller: InstitutionsController;
  let service: InstitutionsService;

  const mockInstitutionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByType: jest.fn(),
    findActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionsController],
      providers: [
        {
          provide: InstitutionsService,
          useValue: mockInstitutionsService,
        },
      ],
    }).compile();

    controller = module.get<InstitutionsController>(InstitutionsController);
    service = module.get<InstitutionsService>(InstitutionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createInstitutionDto: CreateInstitutionDto = {
      nome: 'Test Institution',
      tipo: InstitutionType.MUNICIPAL,
      endereco: 'Test Address',
      configuracoes: '{}',
      ativo: true,
    };

    it('should create an institution', async () => {
      const expectedResult = { id: '1', ...createInstitutionDto };
      mockInstitutionsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createInstitutionDto);

      expect(result).toEqual(expectedResult);
      expect(mockInstitutionsService.create).toHaveBeenCalledWith(createInstitutionDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of institutions', async () => {
      const expectedResult = [
        { id: '1', nome: 'Institution 1' },
        { id: '2', nome: 'Institution 2' },
      ];
      mockInstitutionsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockInstitutionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findActive', () => {
    it('should return active institutions', async () => {
      const expectedResult = [
        { id: '1', nome: 'Institution 1' },
        { id: '2', nome: 'Institution 2' },
      ];
      mockInstitutionsService.findActive.mockResolvedValue(expectedResult);

      const result = await controller.findActive();

      expect(result).toEqual(expectedResult);
      expect(mockInstitutionsService.findActive).toHaveBeenCalled();
    });
  });

  describe('findByType', () => {
    it('should return institutions by type', async () => {
      const expectedResult = [
        { id: '1', nome: 'Institution 1' },
        { id: '2', nome: 'Institution 2' },
      ];
      mockInstitutionsService.findByType.mockResolvedValue(expectedResult);

      const result = await controller.findByType(InstitutionType.MUNICIPAL);

      expect(result).toEqual(expectedResult);
      expect(mockInstitutionsService.findByType).toHaveBeenCalledWith(InstitutionType.MUNICIPAL);
    });
  });

  describe('findOne', () => {
    it('should return an institution', async () => {
      const expectedResult = { id: '1', nome: 'Test Institution' };
      mockInstitutionsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockInstitutionsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    const updateInstitutionDto: UpdateInstitutionDto = {
      nome: 'Updated Name',
    };

    it('should update an institution', async () => {
      const expectedResult = { id: '1', ...updateInstitutionDto };
      mockInstitutionsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateInstitutionDto);

      expect(result).toEqual(expectedResult);
      expect(mockInstitutionsService.update).toHaveBeenCalledWith('1', updateInstitutionDto);
    });
  });

  describe('remove', () => {
    it('should remove an institution', async () => {
      await controller.remove('1');

      expect(mockInstitutionsService.remove).toHaveBeenCalledWith('1');
    });
  });
}); 