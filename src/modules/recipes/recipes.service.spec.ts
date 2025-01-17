import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from 'prisma/prisma.service';
import { Difficulty } from '@prisma/client';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';

/**
 * Tests unitaires du RecipesService
 * Ces tests vérifient le bon fonctionnement de toutes les méthodes du service
 */
describe('RecipesService', () => {
  let service: RecipesService;
  let prismaService: PrismaService;

  // Mock d'une recette complète pour les tests
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
    },
    favorites: []
  };

  // Mock du service Prisma pour simuler les interactions avec la base de données
  const mockPrismaService = {
    recipe: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  // Configuration initiale avant chaque test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  /**
   * Tests de la méthode getAllRecipes
   * Vérifie les différentes options de filtrage et tri
   */
  describe('getAllRecipes', () => {
    // Test sans filtre
    it('devrait retourner toutes les recettes sans filtre', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      const result = await service.getAllRecipes({});
      expect(result).toEqual([mockRecipe]);
    });

    // Test du filtre par difficulté
    it('devrait filtrer les recettes par difficulté', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      await service.getAllRecipes({ difficulty: Difficulty.EASY });
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { difficulty: Difficulty.EASY }
        })
      );
    });

    it('devrait filtrer les recettes par catégorie', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      await service.getAllRecipes({ categoryId: 1 });
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 1 }
        })
      );
    });

    it('devrait filtrer les recettes par ingrédients', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      await service.getAllRecipes({ ingredients: 'tomate' });
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ingredients: { contains: 'tomate', mode: 'insensitive' } }
        })
      );
    });

    it('devrait trier les recettes par nom', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      await service.getAllRecipes({ sortBy: 'name' });
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' }
        })
      );
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockPrismaService.recipe.findMany.mockRejectedValue(new Error());
      await expect(service.getAllRecipes({}))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  /**
   * Tests de la méthode createRecipe
   * Vérifie la création de recettes et la validation des données
   */
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

    it('devrait créer une recette avec succès', async () => {
      mockPrismaService.recipe.create.mockResolvedValue(mockRecipe);
      const result = await service.createRecipe(mockCreateRecipeDto, 5);
      expect(result).toEqual(mockRecipe);
    });

    it('devrait rejeter une image invalide', async () => {
      const invalidImageDto = { ...mockCreateRecipeDto, image: 'invalid-base64' };
      await expect(service.createRecipe(invalidImageDto, 5))
        .rejects
        .toThrow(BadRequestException);
    });

    it('devrait gérer les erreurs de création', async () => {
      mockPrismaService.recipe.create.mockRejectedValue(new Error());
      await expect(service.createRecipe(mockCreateRecipeDto, 5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('searchRecipe', () => {
    it('devrait rechercher des recettes avec un texte donné', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      const result = await service.searchRecipe('test');
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
              { ingredients: { contains: 'test', mode: 'insensitive' } },
            ]
          }
        })
      );
      expect(result).toEqual([mockRecipe]);
    });
  });

  describe('getRecipesByUserId', () => {
    it('devrait retourner les recettes d\'un utilisateur', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      const result = await service.getRecipesByUserId(5);
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith({
        where: { userId: 5 },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockRecipe]);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockPrismaService.recipe.findMany.mockRejectedValue(new Error());
      await expect(service.getRecipesByUserId(5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
