import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from 'prisma/prisma.service';
import { Difficulty } from '@prisma/client';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('RecipesService', () => {
  let service: RecipesService;
  let prismaService: PrismaService;

  const mockRecipe = {
    id: 1,
    name: 'Recette Test',
    description: 'Ceci est une description de recette de test.',
    instructions: 'Mélanger tous les ingrédients et cuire à feu moyen.',
    prepTime: 15,
    cookTime: 30,
    difficulty: Difficulty.EASY,
    ingredients: 'Ingrédient 1, Ingrédient 2',
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    userId: 5,
    categoryId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    recipe: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

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

  describe('getAllRecipes', () => {
    it('Retourne toutes les recettes sans filtre', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      const result = await service.getAllRecipes();
      expect(result).toEqual([mockRecipe]);
    });

    it('Filtre les recettes par difficulté', async () => {
      const filterDto: FilterRecipeDto = { difficulty: Difficulty.EASY };
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      const result = await service.getAllRecipes(filterDto);
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { difficulty: Difficulty.EASY }
        })
      );
    });
  });

  describe('createRecipe', () => {
    const mockCreateRecipeDto = {
      name: 'Recette Test',
      description: 'Description test',
      instructions: 'Instructions test',
      prepTime: 15,
      cookTime: 30,
      difficulty: Difficulty.EASY,
      ingredients: 'Ingrédients test',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      categoryId: 1,
    };

    it('Crée une recette avec succès', async () => {
      mockPrismaService.recipe.create.mockResolvedValue(mockRecipe);
      const result = await service.createRecipe(mockCreateRecipeDto, 5);
      expect(result).toEqual(mockRecipe);
    });

    it('Gère les erreurs de création', async () => {
      mockPrismaService.recipe.create.mockRejectedValue(new Error());
      await expect(service.createRecipe(mockCreateRecipeDto, 5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('getRecipe', () => {
    it('Trouve une recette par id', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(mockRecipe);
      const result = await service.getRecipe(1);
      expect(result).toEqual(mockRecipe);
    });

    it('Lance une erreur si la recette n\'existe pas', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);
      await expect(service.getRecipe(999))
        .rejects
        .toThrow(NotFoundException);
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
      mockPrismaService.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 5 });
      mockPrismaService.recipe.update.mockResolvedValue({ ...mockRecipe, ...updateDto });
      const result = await service.updateRecipe(1, updateDto, 5);
      expect(result).toEqual(expect.objectContaining(updateDto));
    });

    it('Vérifie l\'autorisation de l\'utilisateur', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 999 });
      await expect(service.updateRecipe(1, updateDto, 5))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('deleteRecipe', () => {
    it('Supprime une recette avec succès', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 5 });
      mockPrismaService.recipe.delete.mockResolvedValue(mockRecipe);
      const result = await service.deleteRecipe(1, 5);
      expect(result.message).toBe('Recette supprimée avec succès');
    });
  });

  describe('searchRecipe', () => {
    it('Recherche des recettes par texte', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);
      const result = await service.searchRecipe('test');
      expect(result).toEqual([mockRecipe]);
    });
  });

  describe('getRecipesByUserId', () => {
    const mockUserRecipes = [
      {
        id: 1,
        name: 'Recette 1',
        userId: 5,
        // ... autres propriétés
      },
      {
        id: 2,
        name: 'Recette 2',
        userId: 5,
        // ... autres propriétés
      },
    ];

    it('Retourne les recettes d\'un utilisateur spécifique', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue(mockUserRecipes);
      const result = await service.getRecipesByUserId(5);
      
      expect(prismaService.recipe.findMany).toHaveBeenCalledWith({
        where: { userId: 5 },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockUserRecipes);
    });

    it('Gère les erreurs de récupération', async () => {
      mockPrismaService.recipe.findMany.mockRejectedValue(new Error());
      await expect(service.getRecipesByUserId(5))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
