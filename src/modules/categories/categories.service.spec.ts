import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

/**
 * Tests unitaires du CategoriesService
 * Vérifie le bon fonctionnement des opérations sur les catégories
 */
describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  // Mock d'une catégorie pour les tests
  const mockCategory = {
    id: 1,
    name: 'Desserts',
    description: 'Toutes les recettes sucrées',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock du service Prisma pour simuler la base de données
  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  // Configuration initiale avant chaque test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  /**
   * Tests de getAllCategories
   * Vérifie la récupération de la liste des catégories
   */
  describe('getAllCategories', () => {
    it('devrait retourner toutes les catégories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);
      const result = await service.getAllCategories();
      expect(result).toEqual([mockCategory]);
      expect(prismaService.category.findMany).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockPrismaService.category.findMany.mockRejectedValue(new Error());
      await expect(service.getAllCategories())
        .rejects
        .toThrow(InternalServerErrorException);
    });

    it('devrait retourner un tableau vide s\'il n\'y a pas de catégories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);
      const result = await service.getAllCategories();
      expect(result).toEqual([]);
    });
  });

  /**
   * Tests de createCategory
   * Vérifie la création de nouvelles catégories et la gestion des erreurs
   */
  describe('createCategory', () => {
    const createCategoryDto = {
      name: 'Desserts',
      description: 'Toutes les recettes sucrées'
    };

    it('devrait créer une catégorie avec succès', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory(createCategoryDto);
      expect(result).toEqual(mockCategory);
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: createCategoryDto
      });
    });

    it('devrait créer une catégorie sans description', async () => {
      const dtoWithoutDescription = { name: 'Desserts' };
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue({
        ...mockCategory,
        description: null
      });

      const result = await service.createCategory(dtoWithoutDescription);
      expect(result.description).toBeNull();
    });

    it('devrait rejeter si la catégorie existe déjà', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      mockPrismaService.category.create.mockClear();
      
      await expect(service.createCategory(createCategoryDto))
        .rejects
        .toThrow(ConflictException);
      
      expect(prismaService.category.create).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de création', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockRejectedValue(new Error());
      await expect(service.createCategory(createCategoryDto))
        .rejects
        .toThrow(InternalServerErrorException);
    });

    it('devrait vérifier la casse du nom lors de la vérification d\'unicité', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      const lowerCaseDto = {
        name: 'desserts',
        description: 'Test'
      };
      await expect(service.createCategory(lowerCaseDto))
        .rejects
        .toThrow(ConflictException);
    });
  });
});
