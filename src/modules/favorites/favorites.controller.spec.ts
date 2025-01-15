import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let favoritesService: FavoritesService;

  const mockFavoritesService = {
    getAllFavorites: jest.fn(),
    createFavorite: jest.fn(),
    deleteFavorite: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: FavoritesService,
          useValue: mockFavoritesService,
        },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    favoritesService = module.get<FavoritesService>(FavoritesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFavorites', () => {
    it('Retourne tous les favoris d\'un utilisateur', async () => {
      mockFavoritesService.getAllFavorites.mockResolvedValue([mockFavorite]);
      const mockRequest = {
        user: { id: 5 }
      } as unknown as Request;

      const result = await controller.getAllFavorites(mockRequest);

      expect(favoritesService.getAllFavorites).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockFavorite]);
    });
  });

  describe('createFavorite', () => {
    it('Crée un favori avec succès', async () => {
      mockFavoritesService.createFavorite.mockResolvedValue(mockFavorite);
      const mockRequest = {
        user: { id: 5 }
      } as unknown as Request;

      const result = await controller.createFavorite(mockRequest, 1);

      expect(favoritesService.createFavorite).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual(mockFavorite);
    });
  });

  describe('deleteFavorite', () => {
    it('Supprime un favori avec succès', async () => {
      mockFavoritesService.deleteFavorite.mockResolvedValue({ message: 'Favori supprimé avec succès' });
      const mockRequest = {
        user: { id: 5 }
      } as unknown as Request;

      const result = await controller.deleteFavorite(mockRequest, 1);

      expect(favoritesService.deleteFavorite).toHaveBeenCalledWith(1, 5);
      expect(result.message).toBe('Favori supprimé avec succès');
    });
  });
});
