import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ConflictException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: CategoriesService;

  const mockCategoriesService = {
    getAllCategories: jest.fn(),
    createCategory: jest.fn(),
  };

  const mockCategory = {
    id: 1,
    name: 'Desserts',
    description: 'Toutes les recettes sucrées',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('Retourne toutes les catégories', async () => {
      mockCategoriesService.getAllCategories.mockResolvedValue([mockCategory]);

      const result = await controller.getAllCategories();

      expect(categoriesService.getAllCategories).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('createCategory', () => {
    it('Crée une catégorie avec succès', async () => {
      const createCategoryDto = {
        name: 'Desserts',
        description: 'Toutes les recettes sucrées'
      };
      mockCategoriesService.createCategory.mockResolvedValue(mockCategory);

      const result = await controller.createCategory(createCategoryDto);

      expect(categoriesService.createCategory).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(mockCategory);
    });

    it('Lance une erreur si la catégorie existe déjà', async () => {
      const createCategoryDto = {
        name: 'Desserts',
        description: 'Toutes les recettes sucrées'
      };
      mockCategoriesService.createCategory.mockRejectedValue(new ConflictException());

      await expect(controller.createCategory(createCategoryDto))
        .rejects
        .toThrow(ConflictException);
    });
  });
});
