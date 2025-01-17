import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Difficulty } from '@prisma/client';
import { Request } from 'express';

describe('RecipesController', () => {
  let controller: RecipesController;
  let recipesService: RecipesService;

  const mockRecipes = [
    {
      id: 2,
      name: 'Recette Test 1',
      description: 'Description de la première recette.',
      instructions: 'Instructions pour la première recette.',
      prepTime: 10,
      cookTime: 20,
      difficulty: Difficulty.MEDIUM,
      ingredients: 'Ingrédient A, Ingrédient B',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      userId: 1,
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'Recette Test 2',
      description: 'Description de la deuxième recette.',
      instructions: 'Instructions pour la deuxième recette.',
      prepTime: 5,
      cookTime: 15,
      difficulty: Difficulty.HARD,
      ingredients: 'Ingrédient C, Ingrédient D',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      userId: 2,
      categoryId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockRecipesService = {
    getAllRecipes: jest.fn().mockResolvedValue(mockRecipes),
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
    it('Retourne les recipes sans filtrage', async () => {
      mockRecipesService.getAllRecipes.mockResolvedValue(mockRecipes);
      const result = await controller.getAllRecipes();
      expect(result).toEqual(mockRecipes);
    });

    it('Retourne tout les recipes par category', async () => {
      const filterDto = { categoryId: 1 };
      mockRecipesService.getAllRecipes.mockResolvedValue([mockRecipes[0]]);
      const result = await controller.getAllRecipes(filterDto);
      expect(recipesService.getAllRecipes).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual([mockRecipes[0]]);
    });
  });

  describe('createRecipe', () => {
    const mockCreateRecipeDto = {
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

    it('Crée avec succès un recipe', async () => {
      const mockRequest = { user: { id: 1 } } as unknown as Request;
      mockRecipesService.createRecipe.mockResolvedValue(mockRecipes[0]);
      const result = await controller.createRecipe(mockRequest, mockCreateRecipeDto);
      expect(recipesService.createRecipe).toHaveBeenCalledWith(mockCreateRecipeDto, 1);
      expect(result).toEqual(mockRecipes[0]);
    });
  });

  describe('updateRecipe', () => {
    const updateDto = {
      name: 'Recette Modifiée',
      description: 'Nouvelle description',
      instructions: 'Nouvelles instructions',
      prepTime: 20,
      cookTime: 35,
      difficulty: Difficulty.MEDIUM,
      ingredients: 'Nouveaux ingrédients',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      categoryId: 2,
    };

    it('Met à jour une recette avec succès', async () => {
      const mockRequest = { user: { id: 1 } } as unknown as Request;
      mockRecipesService.updateRecipe.mockResolvedValue({ ...mockRecipes[0], ...updateDto });
      const result = await controller.updateRecipe(mockRequest, 1, updateDto);
      expect(recipesService.updateRecipe).toHaveBeenCalledWith(1, updateDto, 1);
      expect(result).toEqual(expect.objectContaining(updateDto));
    });
  });

  describe('deleteRecipe', () => {
    it('Supprime une recette avec succès', async () => {
      const mockRequest = { user: { id: 1 } } as unknown as Request;
      mockRecipesService.deleteRecipe.mockResolvedValue({ message: 'Recette supprimée avec succès' });
      const result = await controller.deleteRecipe(mockRequest, 1);
      expect(recipesService.deleteRecipe).toHaveBeenCalledWith(1, 1);
      expect(result.message).toBe('Recette supprimée avec succès');
    });
  });

  describe('getRecipe', () => {
    it('Récupère une recette par son id', async () => {
      mockRecipesService.getRecipe.mockResolvedValue(mockRecipes[0]);
      const result = await controller.getRecipe(1);
      expect(recipesService.getRecipe).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRecipes[0]);
    });
  });

  describe('searchRecipe', () => {
    it('Cherche des recettes par texte', async () => {
      mockRecipesService.searchRecipe.mockResolvedValue([mockRecipes[0]]);
      const result = await controller.searchRecipe('Test');
      expect(recipesService.searchRecipe).toHaveBeenCalledWith('Test');
      expect(result).toEqual([mockRecipes[0]]);
    });
  });

  describe('getUserRecipes', () => {
    it('Récupère les recettes d\'un utilisateur', async () => {
      const mockRequest = { user: { id: 1 } } as unknown as Request;
      const mockUserRecipes = [mockRecipes[0]];
      
      mockRecipesService.getRecipesByUserId.mockResolvedValue(mockUserRecipes);
      const result = await controller.getUserRecipes(mockRequest);
      
      expect(recipesService.getRecipesByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserRecipes);
    });
  });
});
