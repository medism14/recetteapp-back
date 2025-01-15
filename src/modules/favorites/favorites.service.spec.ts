import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from 'prisma/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prismaService: PrismaService;

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
    }
  };

  const mockPrismaService = {
    favorite: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    recipe: {
      findUnique: jest.fn(),
    }
  };

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFavorites', () => {
    it('Retourne tous les favoris d\'un utilisateur', async () => {
      mockPrismaService.favorite.findMany.mockResolvedValue([mockFavorite]);

      const result = await service.getAllFavorites(5);

      expect(prismaService.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 5 },
        include: { recipe: true }
      });
      expect(result).toEqual([mockFavorite]);
    });
  });

  describe('createFavorite', () => {
    it('Crée un favori avec succès', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(mockFavorite.recipe);
      mockPrismaService.favorite.create.mockResolvedValue(mockFavorite);

      const result = await service.createFavorite(1, 5);

      expect(prismaService.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 5,
          recipeId: 1
        },
        include: { recipe: true }
      });
      expect(result).toEqual(mockFavorite);
    });

    it('Lance une erreur si la recette n\'existe pas', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(service.createFavorite(999, 5))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('deleteFavorite', () => {
    it('Supprime un favori avec succès', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue({ ...mockFavorite, userId: 5 });
      mockPrismaService.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await service.deleteFavorite(1, 5);

      expect(result.message).toBe('Favori supprimé avec succès');
    });

    it('Lance une erreur si le favori n\'existe pas', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue(null);

      await expect(service.deleteFavorite(999, 5))
        .rejects
        .toThrow(NotFoundException);
    });

    it('Lance une erreur si l\'utilisateur n\'est pas autorisé', async () => {
      mockPrismaService.favorite.findFirst.mockResolvedValue({ ...mockFavorite, userId: 999 });

      await expect(service.deleteFavorite(1, 5))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});
