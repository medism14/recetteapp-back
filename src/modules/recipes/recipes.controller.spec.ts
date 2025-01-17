import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Difficulty } from '@prisma/client';
import { Request } from 'express';

describe('RecipesController', () => {
  let controller: RecipesController;
  let recipesService: RecipesService;

  const mockRecipe = {
    id: 1,
    name: 'Recette Test',
    description: 'Description test',
    instructions: 'Instructions test',
    prepTime: 15,
    cookTime: 30,
    difficulty: Difficulty.EASY,
    ingredients: 'Ingrédients test',
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    userId: 5,
    categoryId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: 1,
      name: 'Catégorie Test',
      description: 'Description catégorie',
      createdAt: new Date()
    },
    user: {
      id: 5,
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User'
    }
  };

  const mockRecipesService = {
    getAllRecipes: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
    getRecipe: jest.fn(),
    searchRecipe: jest.fn(),
    getRecipesByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: mockRecipesService,
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
    recipesService = module.get<RecipesService>(RecipesService);
  });

  describe('getAllRecipes', () => {
    it('devrait retourner toutes les recettes avec les filtres', async () => {
      mockRecipesService.getAllRecipes.mockResolvedValue([mockRecipe]);
      const result = await controller.getAllRecipes(
        Difficulty.EASY,
        '1',
        'tomate',
        'name'
      );
      expect(recipesService.getAllRecipes).toHaveBeenCalledWith({
        difficulty: Difficulty.EASY,
        categoryId: 1,
        ingredients: 'tomate',
        sortBy: 'name'
      });
      expect(result).toEqual([mockRecipe]);
    });
  });

  describe('createRecipe', () => {
    const createDto = {
      name: 'Nouvelle Recette',
      description: 'Description test',
      instructions: 'Instructions test',
      prepTime: 15,
      cookTime: 30,
      difficulty: Difficulty.EASY,
      ingredients: 'Ingrédients test',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      categoryId: 1,
    };

    it('devrait créer une nouvelle recette', async () => {
      const mockRequest = { user: { id: 5 } } as unknown as Request;
      mockRecipesService.createRecipe.mockResolvedValue(mockRecipe);
      const result = await controller.createRecipe(mockRequest, createDto);
      expect(recipesService.createRecipe).toHaveBeenCalledWith(createDto, 5);
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('searchRecipe', () => {
    it('devrait rechercher des recettes avec un texte donné', async () => {
      mockRecipesService.searchRecipe.mockResolvedValue([mockRecipe]);
      const result = await controller.searchRecipe('test');
      expect(recipesService.searchRecipe).toHaveBeenCalledWith('test');
      expect(result).toEqual([mockRecipe]);
    });
  });

  describe('getUserRecipes', () => {
    it('devrait retourner les recettes de l\'utilisateur connecté', async () => {
      const mockRequest = { user: { id: 5 } } as unknown as Request;
      mockRecipesService.getRecipesByUserId.mockResolvedValue([mockRecipe]);
      const result = await controller.getUserRecipes(mockRequest);
      expect(recipesService.getRecipesByUserId).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockRecipe]);
    });
  });
});
