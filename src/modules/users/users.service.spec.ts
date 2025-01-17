import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('Doit retourner un utilisateur quand il existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          password: true,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('Doit retourner null quand l\'utilisateur n\'existe pas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('Doit lancer une InternalServerErrorException en cas d\'erreur de base de données', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(service.getUserByEmail('test@example.com'))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      {
        id: 1,
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
      },
      {
        id: 2,
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        createdAt: new Date(),
      },
    ];

    beforeEach(() => {
      mockPrismaService.user.findMany = jest.fn();
    });

    it('Doit retourner tous les utilisateurs', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it('Doit lancer une InternalServerErrorException en cas d\'erreur', async () => {
      mockPrismaService.user.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(service.getAllUsers())
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
