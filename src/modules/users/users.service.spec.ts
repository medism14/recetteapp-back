import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Suite de tests pour UsersService
 * Ces tests vérifient le bon fonctionnement des méthodes du service utilisateur
 */
describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  // Mock d'un utilisateur pour les tests
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
  };

  // Mock du service Prisma pour simuler les interactions avec la base de données
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  // Configuration initiale avant chaque test
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

  // Nettoyage des mocks après chaque test
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests pour la méthode getUserByEmail
   */
  describe('getUserByEmail', () => {
    // Test du cas où l'utilisateur existe
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

    // Test du cas où l'utilisateur n'existe pas
    it('Doit retourner null quand l\'utilisateur n\'existe pas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });

    // Test de la gestion des erreurs
    it('Doit lancer une InternalServerErrorException en cas d\'erreur de base de données', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(service.getUserByEmail('test@example.com'))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  /**
   * Tests pour la méthode getAllUsers
   */
  describe('getAllUsers', () => {
    // Mock des données de test pour plusieurs utilisateurs
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

    // Test de la récupération réussie des utilisateurs
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

    // Test de la gestion des erreurs
    it('Doit lancer une InternalServerErrorException en cas d\'erreur', async () => {
      mockPrismaService.user.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(service.getAllUsers())
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
