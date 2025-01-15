import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  const mockCategory = {
    id: 1,
    name: 'Desserts',
    description: 'Toutes les recettes sucrées',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('Retourne toutes les catégories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.getAllCategories();

      expect(prismaService.category.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });

    it('Lance une erreur si quelque chose se passe mal', async () => {
      mockPrismaService.category.findMany.mockRejectedValue(new Error());

      await expect(service.getAllCategories())
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });

  describe('createCategory', () => {
    const createCategoryDto = {
      name: 'Desserts',
      description: 'Toutes les recettes sucrées'
    };

    it('Crée une catégorie avec succès', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory(createCategoryDto);

      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: createCategoryDto
      });
      expect(result).toEqual(mockCategory);
    });

    it('Lance une erreur si la catégorie existe déjà', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(service.createCategory(createCategoryDto))
        .rejects
        .toThrow(ConflictException);
    });

    it('Lance une erreur si la création échoue', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockRejectedValue(new Error());

      await expect(service.createCategory(createCategoryDto))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
