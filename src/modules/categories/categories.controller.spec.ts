import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: CategoriesService;

  const mockCategory = {
    id: 1,
    name: 'Desserts',
    description: 'Toutes les recettes sucrées',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoriesService = {
    getAllCategories: jest.fn(),
    createCategory: jest.fn(),
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

  describe('getAllCategories', () => {
    it('devrait retourner toutes les catégories', async () => {
      mockCategoriesService.getAllCategories.mockResolvedValue([mockCategory]);
      const result = await controller.getAllCategories();
      expect(result).toEqual([mockCategory]);
    });

    it('devrait gérer les erreurs de service', async () => {
      mockCategoriesService.getAllCategories.mockRejectedValue(
        new InternalServerErrorException()
      );
      await expect(controller.getAllCategories())
        .rejects
        .toThrow(InternalServerErrorException);
    });

    it('devrait retourner un tableau vide quand il n\'y a pas de catégories', async () => {
      mockCategoriesService.getAllCategories.mockResolvedValue([]);
      const result = await controller.getAllCategories();
      expect(result).toEqual([]);
    });
  });

  describe('createCategory', () => {
    const createCategoryDto = {
      name: 'Desserts',
      description: 'Toutes les recettes sucrées'
    };

    it('devrait créer une catégorie avec succès', async () => {
      mockCategoriesService.createCategory.mockResolvedValue(mockCategory);
      const result = await controller.createCategory(createCategoryDto);
      expect(result).toEqual(mockCategory);
    });

    it('devrait créer une catégorie sans description', async () => {
      const dtoWithoutDescription = { name: 'Desserts' };
      const categoryWithoutDescription = { ...mockCategory, description: null };
      mockCategoriesService.createCategory.mockResolvedValue(categoryWithoutDescription);
      
      const result = await controller.createCategory(dtoWithoutDescription);
      expect(result.description).toBeNull();
    });

    it('devrait gérer le conflit de nom de catégorie', async () => {
      mockCategoriesService.createCategory.mockRejectedValue(
        new ConflictException('Une catégorie avec ce nom existe déjà')
      );
      await expect(controller.createCategory(createCategoryDto))
        .rejects
        .toThrow(ConflictException);
    });

    it('devrait gérer les erreurs de service', async () => {
      mockCategoriesService.createCategory.mockRejectedValue(
        new InternalServerErrorException()
      );
      await expect(controller.createCategory(createCategoryDto))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
