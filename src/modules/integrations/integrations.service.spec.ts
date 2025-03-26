import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { Plataforma } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    integracaoPlataforma: {
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
        IntegrationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockPrismaService.integracaoPlataforma.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.integracaoPlataforma.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all integrations', async () => {
      const expectedResult = [
        {
          id: 'test-id-1',
          nome: 'Integration 1',
          plataforma: Plataforma.GOOGLE_CLASSROOM,
          ativo: true,
        },
        {
          id: 'test-id-2',
          nome: 'Integration 2',
          plataforma: Plataforma.MICROSOFT_TEAMS,
          ativo: true,
        },
      ];

      mockPrismaService.integracaoPlataforma.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll({ ativo: true });

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.integracaoPlataforma.findMany).toHaveBeenCalledWith({
        where: { ativo: true },
      });
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

      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne('test-id');

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.integracaoPlataforma.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should throw NotFoundException when integration is not found', async () => {
      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
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

      mockPrismaService.integracaoPlataforma.update.mockResolvedValue(expectedResult);

      const result = await service.update('test-id', updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.integracaoPlataforma.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when integration is not found', async () => {
      mockPrismaService.integracaoPlataforma.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
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

      mockPrismaService.integracaoPlataforma.delete.mockResolvedValue(expectedResult);

      const result = await service.remove('test-id');

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.integracaoPlataforma.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should throw NotFoundException when integration is not found', async () => {
      mockPrismaService.integracaoPlataforma.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('authorize', () => {
    it('should generate authorization URL for active integration', async () => {
      const integration = {
        id: 'test-id',
        plataforma: Plataforma.GOOGLE_CLASSROOM,
        ativo: true,
        clientId: 'test-client-id',
        redirectUri: 'https://test.com/callback',
        escopos: 'test-scopes',
      };

      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(integration);

      const result = await service.authorize('test-id');

      expect(result).toHaveProperty('url');
      expect(result.url).toContain('test-client-id');
      expect(result.url).toContain('https://test.com/callback');
    });

    it('should throw BadRequestException for inactive integration', async () => {
      const integration = {
        id: 'test-id',
        ativo: false,
      };

      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(integration);

      await expect(service.authorize('test-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when integration is not found', async () => {
      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(null);

      await expect(service.authorize('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('callback', () => {
    it('should process authorization callback', async () => {
      const integration = {
        id: 'test-id',
        plataforma: Plataforma.GOOGLE_CLASSROOM,
        ativo: true,
      };

      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(integration);

      const result = await service.callback('test-id', 'test-code');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Autorização processada com sucesso');
    });

    it('should throw NotFoundException when integration is not found', async () => {
      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(null);

      await expect(service.callback('non-existent-id', 'test-code')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sync', () => {
    it('should start data synchronization for authorized integration', async () => {
      const integration = {
        id: 'test-id',
        plataforma: Plataforma.GOOGLE_CLASSROOM,
        ativo: true,
      };

      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(integration);

      const result = await service.sync('test-id');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Sincronização iniciada com sucesso');
    });

    it('should throw BadRequestException for unauthorized integration', async () => {
      const integration = {
        id: 'test-id',
        ativo: false,
      };

      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(integration);

      await expect(service.sync('test-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when integration is not found', async () => {
      mockPrismaService.integracaoPlataforma.findUnique.mockResolvedValue(null);

      await expect(service.sync('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 