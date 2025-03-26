import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Equipe, CargoEquipe } from '@prisma/client';

describe('TeamsService', () => {
  let service: TeamsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    equipe: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    membroEquipe: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    estudanteEquipe: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
    },
    estudante: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTeamDto = {
      nome: 'Equipe Teste',
      descricao: 'Descrição da equipe',
      ativo: true,
      membros: [
        { usuarioId: '1', cargo: CargoEquipe.COORDENADOR },
      ],
      estudantes: [
        { estudanteId: '1' },
      ],
    };

    it('should create a team successfully', async () => {
      const mockTeam = {
        id: '1',
        ...createTeamDto,
        membros: [],
        estudantes: [],
      };

      mockPrismaService.equipe.create.mockResolvedValue(mockTeam);
      mockPrismaService.membroEquipe.create.mockResolvedValue({});
      mockPrismaService.estudanteEquipe.create.mockResolvedValue({});

      const result = await service.create(createTeamDto);

      expect(result).toEqual(mockTeam);
      expect(mockPrismaService.equipe.create).toHaveBeenCalled();
      expect(mockPrismaService.membroEquipe.create).toHaveBeenCalled();
      expect(mockPrismaService.estudanteEquipe.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when member already exists', async () => {
      mockPrismaService.membroEquipe.findFirst.mockResolvedValue({});

      await expect(service.create(createTeamDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when student already exists', async () => {
      mockPrismaService.estudanteEquipe.findFirst.mockResolvedValue({});

      await expect(service.create(createTeamDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all teams', async () => {
      const mockTeams = [
        { id: '1', nome: 'Equipe 1' },
        { id: '2', nome: 'Equipe 2' },
      ];

      mockPrismaService.equipe.findMany.mockResolvedValue(mockTeams);

      const result = await service.findAll();

      expect(result).toEqual(mockTeams);
      expect(mockPrismaService.equipe.findMany).toHaveBeenCalled();
    });

    it('should filter teams by active status', async () => {
      const mockTeams = [
        { id: '1', nome: 'Equipe 1', ativo: true },
      ];

      mockPrismaService.equipe.findMany.mockResolvedValue(mockTeams);

      const result = await service.findAll(true);

      expect(result).toEqual(mockTeams);
      expect(mockPrismaService.equipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ativo: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a team by id', async () => {
      const mockTeam = {
        id: '1',
        nome: 'Equipe Teste',
      };

      mockPrismaService.equipe.findUnique.mockResolvedValue(mockTeam);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTeam);
      expect(mockPrismaService.equipe.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateTeamDto = {
      nome: 'Nova Equipe',
      descricao: 'Nova descrição',
    };

    it('should update a team successfully', async () => {
      const mockTeam = {
        id: '1',
        ...updateTeamDto,
      };

      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.equipe.update.mockResolvedValue(mockTeam);

      const result = await service.update('1', updateTeamDto);

      expect(result).toEqual(mockTeam);
      expect(mockPrismaService.equipe.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateTeamDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a team successfully', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.equipe.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');

      expect(mockPrismaService.equipe.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when team has members', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({
        id: '1',
        membros: [{ id: '1' }],
      });

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addMember', () => {
    it('should add a member successfully', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.usuario.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.membroEquipe.findFirst.mockResolvedValue(null);
      mockPrismaService.membroEquipe.create.mockResolvedValue({});

      await service.addMember('1', '1', CargoEquipe.COORDENADOR);

      expect(mockPrismaService.membroEquipe.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue(null);

      await expect(service.addMember('1', '1', CargoEquipe.COORDENADOR))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.addMember('1', '1', CargoEquipe.COORDENADOR))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when member already exists', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.usuario.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.membroEquipe.findFirst.mockResolvedValue({});

      await expect(service.addMember('1', '1', CargoEquipe.COORDENADOR))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member successfully', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.membroEquipe.findFirst.mockResolvedValue({
        id: '1',
        ativo: true,
      });
      mockPrismaService.membroEquipe.update.mockResolvedValue({});

      await service.removeMember('1', '1');

      expect(mockPrismaService.membroEquipe.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue(null);

      await expect(service.removeMember('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when member not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.membroEquipe.findFirst.mockResolvedValue(null);

      await expect(service.removeMember('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when member is already inactive', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.membroEquipe.findFirst.mockResolvedValue({
        id: '1',
        ativo: false,
      });

      await expect(service.removeMember('1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addStudent', () => {
    it('should add a student successfully', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudanteEquipe.findFirst.mockResolvedValue(null);
      mockPrismaService.estudanteEquipe.create.mockResolvedValue({});

      await service.addStudent('1', '1');

      expect(mockPrismaService.estudanteEquipe.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue(null);

      await expect(service.addStudent('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudante.findUnique.mockResolvedValue(null);

      await expect(service.addStudent('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when student already exists', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudante.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudanteEquipe.findFirst.mockResolvedValue({});

      await expect(service.addStudent('1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeStudent', () => {
    it('should remove a student successfully', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudanteEquipe.findFirst.mockResolvedValue({
        id: '1',
        ativo: true,
      });
      mockPrismaService.estudanteEquipe.update.mockResolvedValue({});

      await service.removeStudent('1', '1');

      expect(mockPrismaService.estudanteEquipe.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when team not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue(null);

      await expect(service.removeStudent('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudanteEquipe.findFirst.mockResolvedValue(null);

      await expect(service.removeStudent('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when student is already inactive', async () => {
      mockPrismaService.equipe.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.estudanteEquipe.findFirst.mockResolvedValue({
        id: '1',
        ativo: false,
      });

      await expect(service.removeStudent('1', '1')).rejects.toThrow(BadRequestException);
    });
  });
}); 