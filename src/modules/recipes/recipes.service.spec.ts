import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from '@prisma/prisma.service';
import { Difficulty } from '@prisma/client';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';

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
    imageUrl: 'http://example.com/image.jpg',
    userId: 5,
    categoryId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
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


  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRecipes', () => {
    it('devrait retourner toutes les recettes avec les paramètres par défaut', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue(mockRecipes);

      const result = await service.getAllRecipes();

      expect(prismaService.recipe.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
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
      });
      expect(result).toEqual(mockRecipes);
    });

    it('devrait retourner les recettes qui sont faciles à faire', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue(mockRecipes);

      const filterDto: FilterRecipeDto = { difficulty: Difficulty.EASY };

      const result = await service.getAllRecipes(filterDto);

      expect(prismaService.recipe.findMany).toHaveBeenCalledWith({
        where: {
          difficulty: Difficulty.EASY,
        },
        orderBy: { createdAt: 'desc' },
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
      });
      expect(result).toEqual(mockRecipes);
    });
  });

  describe('createRecipe', () => {
    it('Lorsque la création se passe bien' , async () => {
      mockPrismaService.recipe.create.mockResolvedValue(mockRecipe);

      const result = service.createRecipe(mockCreateRecipeDto, 1);

      expect(prismaService.recipe.create({
        data: {
          name: mockCreateRecipeDto.name,
          description: mockCreateRecipeDto.description,
          prepTime: mockCreateRecipeDto.prepTime,
          cookTime: mockCreateRecipeDto.cookTime,
          difficulty: mockCreateRecipeDto.difficulty,
          ingredients: mockCreateRecipeDto.ingredients,
          instructions: mockCreateRecipeDto.instructions,
          imageUrl: mockCreateRecipeDto.imageUrl,
          categoryId: mockCreateRecipeDto.categoryId,
          userId: 5,
        },
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
      }));
      expect(result).toEqual(mockRecipe);
    })

    it('Lorsqu\'il y\'a une erreur avec prisma', async () => {
      mockPrismaService.recipe.create.mockResolvedValue(new BadRequestException("Une erreur est survenue"));

      await expect(service.createRecipe(mockCreateRecipeDto, 5))
      .rejects
      .toThrow(InternalServerErrorException)
    })
  })

  describe('getRecipe', () => {
    it('devrait retourner une recette spécifique', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(mockRecipe);

      const result = await service.getRecipe(1);

      expect(prismaService.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
      });
      expect(result).toEqual(mockRecipe);
    });

    it('devrait throw NotFoundException quand la recette n\'existe pas', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      await expect(service.getRecipe(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRecipe', () => {
    const updateDto = {
      name: 'Recette Modifiée',
      description: 'Nouvelle description',
      prepTime: 20,
      cookTime: 35,
      difficulty: Difficulty.MEDIUM,
      ingredients: 'Nouveaux ingrédients',
      instructions: 'Nouvelles instructions',
      imageUrl: 'http://example.com/new-image.jpg',
      categoryId: 2,
    };

    it('devrait mettre à jour une recette avec succès', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 1 });
      mockPrismaService.recipe.update.mockResolvedValue({ ...mockRecipe, ...updateDto });

      const result = await service.updateRecipe(1, updateDto, 1);

      expect(result.name).toBe(updateDto.name);
    });

    it('devrait throw UnauthorizedException si l\'utilisateur n\'est pas le propriétaire', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 2 });

      await expect(service.updateRecipe(1, updateDto, 1))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('deleteRecipe', () => {
    it('devrait supprimer une recette avec succès', async () => {
      mockPrismaService.recipe.findUnique.mockResolvedValue({ ...mockRecipe, userId: 1 });
      mockPrismaService.recipe.delete.mockResolvedValue(mockRecipe);

      const result = await service.deleteRecipe(1, 1);

      expect(result.message).toBe('Recette supprimée avec succès');
    });
  });

  describe('searchRecipe', () => {
    it('devrait chercher des recettes par texte', async () => {
      mockPrismaService.recipe.findMany.mockResolvedValue([mockRecipe]);

      const result = await service.searchRecipe('Test');

      expect(prismaService.recipe.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { description: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
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
      });
      expect(result).toEqual([mockRecipe]);
    });
  });
});
