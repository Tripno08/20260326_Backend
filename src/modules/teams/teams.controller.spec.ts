import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CargoEquipe } from '@prisma/client';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    addStudent: jest.fn(),
    removeStudent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTeamDto: CreateTeamDto = {
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
      };

      mockTeamsService.create.mockResolvedValue(mockTeam);

      const result = await controller.create(createTeamDto);

      expect(result).toEqual(mockTeam);
      expect(mockTeamsService.create).toHaveBeenCalledWith(createTeamDto);
    });

    it('should throw BadRequestException when service throws BadRequestException', async () => {
      mockTeamsService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(createTeamDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all teams', async () => {
      const mockTeams = [
        { id: '1', nome: 'Equipe 1' },
        { id: '2', nome: 'Equipe 2' },
      ];

      mockTeamsService.findAll.mockResolvedValue(mockTeams);

      const result = await controller.findAll();

      expect(result).toEqual(mockTeams);
      expect(mockTeamsService.findAll).toHaveBeenCalled();
    });

    it('should filter teams by active status', async () => {
      const mockTeams = [
        { id: '1', nome: 'Equipe 1', ativo: true },
      ];

      mockTeamsService.findAll.mockResolvedValue(mockTeams);

      const result = await controller.findAll(true);

      expect(result).toEqual(mockTeams);
      expect(mockTeamsService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('should return a team by id', async () => {
      const mockTeam = {
        id: '1',
        nome: 'Equipe Teste',
      };

      mockTeamsService.findOne.mockResolvedValue(mockTeam);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockTeam);
      expect(mockTeamsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when team not found', async () => {
      mockTeamsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateTeamDto: UpdateTeamDto = {
      nome: 'Nova Equipe',
      descricao: 'Nova descrição',
    };

    it('should update a team successfully', async () => {
      const mockTeam = {
        id: '1',
        ...updateTeamDto,
      };

      mockTeamsService.update.mockResolvedValue(mockTeam);

      const result = await controller.update('1', updateTeamDto);

      expect(result).toEqual(mockTeam);
      expect(mockTeamsService.update).toHaveBeenCalledWith('1', updateTeamDto);
    });

    it('should throw NotFoundException when team not found', async () => {
      mockTeamsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('1', updateTeamDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a team successfully', async () => {
      mockTeamsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockTeamsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when team not found', async () => {
      mockTeamsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when team has members', async () => {
      mockTeamsService.remove.mockRejectedValue(new BadRequestException());

      await expect(controller.remove('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addMember', () => {
    it('should add a member successfully', async () => {
      mockTeamsService.addMember.mockResolvedValue(undefined);

      await controller.addMember('1', '1', CargoEquipe.COORDENADOR);

      expect(mockTeamsService.addMember).toHaveBeenCalledWith('1', '1', CargoEquipe.COORDENADOR);
    });

    it('should throw NotFoundException when team or user not found', async () => {
      mockTeamsService.addMember.mockRejectedValue(new NotFoundException());

      await expect(controller.addMember('1', '1', CargoEquipe.COORDENADOR))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when member already exists', async () => {
      mockTeamsService.addMember.mockRejectedValue(new BadRequestException());

      await expect(controller.addMember('1', '1', CargoEquipe.COORDENADOR))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member successfully', async () => {
      mockTeamsService.removeMember.mockResolvedValue(undefined);

      await controller.removeMember('1', '1');

      expect(mockTeamsService.removeMember).toHaveBeenCalledWith('1', '1');
    });

    it('should throw NotFoundException when team or member not found', async () => {
      mockTeamsService.removeMember.mockRejectedValue(new NotFoundException());

      await expect(controller.removeMember('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when member is already inactive', async () => {
      mockTeamsService.removeMember.mockRejectedValue(new BadRequestException());

      await expect(controller.removeMember('1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addStudent', () => {
    it('should add a student successfully', async () => {
      mockTeamsService.addStudent.mockResolvedValue(undefined);

      await controller.addStudent('1', '1');

      expect(mockTeamsService.addStudent).toHaveBeenCalledWith('1', '1');
    });

    it('should throw NotFoundException when team or student not found', async () => {
      mockTeamsService.addStudent.mockRejectedValue(new NotFoundException());

      await expect(controller.addStudent('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when student already exists', async () => {
      mockTeamsService.addStudent.mockRejectedValue(new BadRequestException());

      await expect(controller.addStudent('1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeStudent', () => {
    it('should remove a student successfully', async () => {
      mockTeamsService.removeStudent.mockResolvedValue(undefined);

      await controller.removeStudent('1', '1');

      expect(mockTeamsService.removeStudent).toHaveBeenCalledWith('1', '1');
    });

    it('should throw NotFoundException when team or student not found', async () => {
      mockTeamsService.removeStudent.mockRejectedValue(new NotFoundException());

      await expect(controller.removeStudent('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when student is already inactive', async () => {
      mockTeamsService.removeStudent.mockRejectedValue(new BadRequestException());

      await expect(controller.removeStudent('1', '1')).rejects.toThrow(BadRequestException);
    });
  });
}); 