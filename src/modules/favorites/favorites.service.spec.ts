import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';

/**
 * Tests unitaires du FavoritesService
 * Vérifie toutes les fonctionnalités de gestion des favoris
 */
describe('FavoritesService', () => {
  let service: FavoritesService;
  let prismaService: PrismaService;

  // Mock d'un favori avec sa recette associée pour les tests
  const mockFavorite = {
    id: 1,
    userId: 5,
    recipeId: 1,
    createdAt: new Date(),
    recipe: {
      id: 1,
      name: 'Recette Test',
      description: 'Description test',
      instructions: 'Instructions test',
      prepTime: 15,
      cookTime: 30,
      difficulty: 'EASY',
      ingredients: 'Ingrédients test',
      imageUrl: 'http://example.com/image.jpg',
      userId: 1,
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: 1,
        name: 'Catégorie Test',
        description: 'Description catégorie',
        createdAt: new Date()
      }
    }
  };

  // Mock du service Prisma pour simuler la base de données
  const mockPrismaService = {
    favorite: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    recipe: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    }
  };

  // Configuration initiale avant chaque test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  /**
   * Tests de getAllFavorites
   * Vérifie la récupération des favoris d'un utilisateur
   */
  describe('getAllFavorites', () => {
    it('devrait retourner tous les favoris d\'un utilisateur', async () => {
      mockPrismaService.favorite.findMany.mockResolvedValue([mockFavorite]);
      const result = await service.getAllFavorites(5);
      expect(result).toEqual([mockFavorite]);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockPrismaService.favorite.findMany.mockRejectedValue(new Error());
      await expect(service.getAllFavorites(5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('createFavorite', () => {
    it('devrait créer un favori avec succès', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(mockFavorite.recipe);
      mockPrismaService.favorite.findFirst.mockResolvedValue(null);
      mockPrismaService.favorite.create.mockResolvedValue(mockFavorite);

      const result = await service.createFavorite(1, 5);
      expect(result).toEqual(mockFavorite);
    });

    it('devrait rejeter si la recette n\'existe pas', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);
      await expect(service.createFavorite(999, 5))
        .rejects
        .toThrow(NotFoundException);
    });

    it('devrait rejeter si le favori existe déjà', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(mockFavorite.recipe);
      mockPrismaService.favorite.findFirst.mockResolvedValue(mockFavorite);
      await expect(service.createFavorite(1, 5))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('devrait gérer les erreurs de création', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(mockFavorite.recipe);
      mockPrismaService.favorite.findFirst.mockResolvedValue(null);
      mockPrismaService.favorite.create.mockRejectedValue(new InternalServerErrorException());
      
      await expect(service.createFavorite(1, 5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('deleteFavorite', () => {
    it('devrait supprimer un favori avec succès', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue(mockFavorite);
      mockPrismaService.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await service.deleteFavorite(1, 5);
      expect(result.message).toBe('Favori supprimé avec succès');
    });

    it('devrait rejeter si le favori n\'existe pas', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue(null);
      await expect(service.deleteFavorite(999, 5))
        .rejects
        .toThrow(NotFoundException);
    });

    it('devrait rejeter si l\'utilisateur n\'est pas autorisé', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue({...mockFavorite, userId: 999});
      await expect(service.deleteFavorite(1, 5))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('devrait gérer les erreurs de suppression', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue(mockFavorite);
      mockPrismaService.favorite.delete.mockRejectedValue(new Error());
      await expect(service.deleteFavorite(1, 5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('getFavoritesByUserId', () => {
    it('devrait retourner les favoris d\'un utilisateur spécifique', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 5 });
      mockPrismaService.favorite.findMany.mockResolvedValue([mockFavorite]);

      const result = await service.getFavoritesByUserId(5);
      expect(result).toEqual([mockFavorite]);
    });

    it('devrait rejeter si l\'utilisateur n\'existe pas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.getFavoritesByUserId(999))
        .rejects
        .toThrow(NotFoundException);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 5 });
      mockPrismaService.favorite.findMany.mockRejectedValue(new Error());
      await expect(service.getFavoritesByUserId(5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('isFavorite', () => {
    it('devrait retourner true si la recette est en favori', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue(mockFavorite);
      const result = await service.isFavorite(1, 5);
      expect(result).toEqual({ isFavorite: true });
    });

    it('devrait retourner false si la recette n\'est pas en favori', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue(null);
      const result = await service.isFavorite(1, 5);
      expect(result).toEqual({ isFavorite: false });
    });

    it('devrait gérer les erreurs de vérification', async () => {
      mockPrismaService.favorite.findFirst.mockRejectedValue(new Error());
      await expect(service.isFavorite(1, 5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
