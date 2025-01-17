import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let favoritesService: FavoritesService;

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
      category: {
        id: 1,
        name: 'Catégorie Test'
      }
    }
  };

  const mockFavoritesService = {
    getAllFavorites: jest.fn(),
    createFavorite: jest.fn(),
    deleteFavorite: jest.fn(),
    getFavoritesByUserId: jest.fn(),
    isFavorite: jest.fn(),
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

  describe('getAllFavorites', () => {
    it('devrait retourner tous les favoris de l\'utilisateur', async () => {
      const mockRequest = { user: { id: 5 } } as unknown as Request;
      mockFavoritesService.getAllFavorites.mockResolvedValue([mockFavorite]);

      const result = await controller.getAllFavorites(mockRequest);
      expect(favoritesService.getAllFavorites).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockFavorite]);
    });
  });

  describe('createFavorite', () => {
    it('devrait créer un nouveau favori', async () => {
      const mockRequest = { user: { id: 5 } } as unknown as Request;
      mockFavoritesService.createFavorite.mockResolvedValue(mockFavorite);

      const result = await controller.createFavorite(mockRequest, 1);
      expect(favoritesService.createFavorite).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual(mockFavorite);
    });
  });

  describe('deleteFavorite', () => {
    it('devrait supprimer un favori', async () => {
      const mockRequest = { user: { id: 5 } } as unknown as Request;
      mockFavoritesService.deleteFavorite.mockResolvedValue({ message: 'Favori supprimé avec succès' });

      const result = await controller.deleteFavorite(mockRequest, 1);
      expect(favoritesService.deleteFavorite).toHaveBeenCalledWith(1, 5);
      expect(result.message).toBe('Favori supprimé avec succès');
    });
  });

  describe('getFavoritesByUserId', () => {
    it('devrait retourner les favoris d\'un utilisateur spécifique', async () => {
      mockFavoritesService.getFavoritesByUserId.mockResolvedValue([mockFavorite]);

      const result = await controller.getFavoritesByUserId(5);
      expect(favoritesService.getFavoritesByUserId).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockFavorite]);
    });
  });

  describe('isFavorite', () => {
    it('devrait vérifier si une recette est en favori', async () => {
      const mockRequest = { user: { id: 5 } } as unknown as Request;
      mockFavoritesService.isFavorite.mockResolvedValue({ isFavorite: true });

      const result = await controller.isFavorite(mockRequest, 1);
      expect(favoritesService.isFavorite).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual({ isFavorite: true });
    });
  });
});
