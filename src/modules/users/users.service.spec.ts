import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    usuario: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'Password123',
      cargo: CargoUsuario.PROFESSOR,
    };

    it('should create a user successfully', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.usuario.create.mockResolvedValue({ id: '1', ...createUserDto });

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(createUserDto.email);
      expect(result.nome).toBe(createUserDto.nome);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({ id: '1', email: createUserDto.email });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', email: 'user1@example.com', nome: 'User 1' },
        { id: '2', email: 'user2@example.com', nome: 'User 2' },
      ];
      mockPrismaService.usuario.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockPrismaService.usuario.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', email: 'test@example.com', nome: 'Test User' };
      mockPrismaService.usuario.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      nome: 'Updated Name',
    };

    it('should update a user successfully', async () => {
      const existingUser = { id: '1', email: 'test@example.com', nome: 'Test User' };
      mockPrismaService.usuario.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.usuario.update.mockResolvedValue({ ...existingUser, ...updateUserDto });

      const result = await service.update('1', updateUserDto);

      expect(result.nome).toBe(updateUserDto.nome);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const user = { id: '1', email: 'test@example.com', nome: 'Test User' };
      mockPrismaService.usuario.findUnique.mockResolvedValue(user);
      mockPrismaService.usuario.delete.mockResolvedValue(user);

      await expect(service.remove('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
}); 