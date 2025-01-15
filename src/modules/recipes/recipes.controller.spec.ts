import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Difficulty } from '@prisma/client';
import { Request } from 'express';
import { InternalServerErrorException } from '@nestjs/common';

describe('RecipesController', () => {
  let controller: RecipesController;
  let recipesService: RecipesService;

  const mockRecipesServices = {
    getAllRecipes: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
    getRecipe: jest.fn(),
    searchRecipe: jest.fn(),
  };

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
      imageUrl: 'http://example.com/image1.jpg',
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
      imageUrl: 'http://example.com/image2.jpg',
      userId: 2,
      categoryId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockRecipe = {
    id: 1,
    name: 'Recette Test',
    description: 'Ceci est une description de recette de test.',
    instructions: 'Mélanger tous les ingrédients et cuire à feu moyen.',
    prepTime: 15,
    cookTime: 30,
    difficulty: Difficulty.EASY,
    ingredients: 'Ingrédient 1, Ingrédient 2',
    imageUrl: 'http://example.com/image.jpg',
    userId: 5,
    categoryId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateRecipeDto = {
    name: 'Recette Test',
    description: 'Ceci est une description de recette de test.',
    instructions: 'Mélanger tous les ingrédients et cuire à feu moyen.',
    prepTime: 15,
    cookTime: 30,
    difficulty: Difficulty.EASY,
    ingredients: 'Ingrédient 1, Ingrédient 2',
    imageUrl: 'http://example.com/image.jpg',
    categoryId: 5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: mockRecipesServices,
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRecipes', () => {
    it('Retourne les recipes sans filtrage', async () => {
      mockRecipesServices.getAllRecipes.mockResolvedValue(mockRecipes);

      const result = controller.getAllRecipes();
      expect(result).toEqual(mockRecipes);
    });

    it('Retourne tout les recipes par category', async () => {
      mockRecipesServices.getAllRecipes.mockResolvedValue(mockRecipes);

      const filterDto = {
        categoryId: 5
      }

      const result = controller.getAllRecipes(filterDto);

      expect(recipesService.getAllRecipes).toHaveBeenCalledWith(filterDto)
      expect(result).toEqual(mockRecipes);
    });
  });

  describe('createRecipe', () => {
    it('Crée avec succès un recipe', async () => {
      mockRecipesServices.createRecipe.mockResolvedValue(mockRecipe);
      const mockRequest = {
        user: { id: 1 }
      } as unknown as Request;

      const result = controller.createRecipe(mockRequest, mockCreateRecipeDto);

      expect(recipesService.createRecipe).toHaveBeenCalledWith(mockCreateRecipeDto);
      expect(result).toEqual(mockRecipe);
    });

    it('Erreur lors de la création d\'un recipe', async () => {
      mockRecipesServices.createRecipe.mockRejectedValue(new InternalServerErrorException());
      const mockRequest = {
        user: { id: 1 }
      } as unknown as Request;
      
      await expect(controller.createRecipe(mockRequest, mockCreateRecipeDto))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  })

  describe('updateRecipe', () => {
    it('Met à jour une recette avec succès', async () => {
      const updateDto = {
        name: 'Nouvelle Recette',
        description: 'Nouvelle description',
        prepTime: 25,
        cookTime: 40,
        difficulty: Difficulty.MEDIUM,
        ingredients: 'Nouveaux ingrédients',
        imageUrl: 'http://example.com/new.jpg',
        categoryId: 2,
      };

      mockRecipesServices.updateRecipe.mockResolvedValue({ ...mockRecipe, ...updateDto });
      const mockRequest = {
        user: { id: 1 }
      } as unknown as Request;

      const result = await controller.updateRecipe(mockRequest, 1, {
        ...updateDto,
        instructions: 'Instructions test'
      });

      expect(recipesService.updateRecipe).toHaveBeenCalledWith(1, {
        ...updateDto,
        instructions: 'Instructions test'
      }, 1);
      expect(result.name).toBe(updateDto.name);
    });
  });

  describe('deleteRecipe', () => {
    it('Supprime une recette avec succès', async () => {
      mockRecipesServices.deleteRecipe.mockResolvedValue({ message: 'Recette supprimée avec succès' });
      const mockRequest = {
        user: { id: 1 }
      } as unknown as Request;

      const result = await controller.deleteRecipe(mockRequest, 1);

      expect(recipesService.deleteRecipe).toHaveBeenCalledWith(1, 1);
      expect(result.message).toBe('Recette supprimée avec succès');
    });
  });

  describe('getRecipe', () => {
    it('Récupère une recette par son id', async () => {
      mockRecipesServices.getRecipe.mockResolvedValue(mockRecipe);

      const result = await controller.getRecipe(1);

      expect(recipesService.getRecipe).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('searchRecipe', () => {
    it('Cherche des recettes par texte', async () => {
      mockRecipesServices.searchRecipe.mockResolvedValue([mockRecipe]);

      const result = await controller.searchRecipe('Test');

      expect(recipesService.searchRecipe).toHaveBeenCalledWith('Test');
      expect(result).toEqual([mockRecipe]);
    });
  });
});
