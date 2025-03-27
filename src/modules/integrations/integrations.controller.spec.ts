import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { Plataforma } from '@prisma/client';

describe('IntegrationsController', () => {
  let controller: IntegrationsController;
  let service: IntegrationsService;

  const mockIntegrationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    authorize: jest.fn(),
    callback: jest.fn(),
    sync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationsController],
      providers: [
        {
          provide: IntegrationsService,
          useValue: mockIntegrationsService,
        },
      ],
    }).compile();

    controller = module.get<IntegrationsController>(IntegrationsController);
    service = module.get<IntegrationsService>(IntegrationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateIntegrationDto = {
      nome: 'Test Integration',
      plataforma: Plataforma.GOOGLE_CLASSROOM,
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://test.com/callback',
      escopos: 'test-scopes',
    };

    it('should create a new integration', async () => {
      const expectedResult = {
        id: 'test-id',
        ...createDto,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockIntegrationsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockIntegrationsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should find all integrations with ativo filter', async () => {
      const expectedResult = [
        {
          id: 'test-id-1',
          nome: 'Integration 1',
          plataforma: Plataforma.GOOGLE_CLASSROOM,
          ativo: true,
          clientId: 'client1',
          clientSecret: 'secret1',
          tenantId: null,
          redirectUri: 'https://example.com/callback',
          escopos: 'scope1 scope2',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);
      
      const result = await controller.findAll(true);
      
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('should return a single integration', async () => {
      const expectedResult = {
        id: 'test-id',
        nome: 'Test Integration',
        plataforma: Plataforma.GOOGLE_CLASSROOM,
        ativo: true,
      };

      mockIntegrationsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('test-id');

      expect(result).toEqual(expectedResult);
      expect(mockIntegrationsService.findOne).toHaveBeenCalledWith('test-id');
    });
  });

  describe('update', () => {
    const updateDto: UpdateIntegrationDto = {
      nome: 'Updated Integration',
      ativo: false,
    };

    it('should update an integration', async () => {
      const expectedResult = {
        id: 'test-id',
        ...updateDto,
        plataforma: Plataforma.GOOGLE_CLASSROOM,
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'https://test.com/callback',
        escopos: 'test-scopes',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockIntegrationsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('test-id', updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockIntegrationsService.update).toHaveBeenCalledWith('test-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an integration', async () => {
      const expectedResult = {
        id: 'test-id',
        nome: 'Test Integration',
        plataforma: Plataforma.GOOGLE_CLASSROOM,
        ativo: true,
      };

      mockIntegrationsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('test-id');

      expect(result).toEqual(expectedResult);
      expect(mockIntegrationsService.remove).toHaveBeenCalledWith('test-id');
    });
  });

  describe('authorize', () => {
    it('should generate authorization URL', async () => {
      const expectedResult = {
        url: 'https://test.com/authorize?client_id=test-client-id&redirect_uri=https://test.com/callback',
      };

      mockIntegrationsService.authorize.mockResolvedValue(expectedResult);

      const result = await controller.authorize('test-id');

      expect(result).toEqual(expectedResult);
      expect(mockIntegrationsService.authorize).toHaveBeenCalledWith('test-id');
    });
  });

  describe('callback', () => {
    it('should handle OAuth callback', async () => {
      const expectedResult = { 
        success: true,
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresIn: 3600,
        message: 'Callback processado com sucesso'
      };
      
      jest.spyOn(service, 'callback').mockResolvedValue(expectedResult);
      
      const result = await controller.callback('test-id', 'test-code');
      
      expect(result).toEqual(expectedResult);
      expect(service.callback).toHaveBeenCalledWith('test-id', 'test-code');
    });
  });

  describe('sync', () => {
    it('should start data synchronization', async () => {
      const expectedResult = {
        success: true,
        message: 'Sincronização iniciada com sucesso',
      };

      mockIntegrationsService.sync.mockResolvedValue(expectedResult);

      const result = await controller.sync('test-id');

      expect(result).toEqual(expectedResult);
      expect(mockIntegrationsService.sync).toHaveBeenCalledWith('test-id');
    });
  });
}); 