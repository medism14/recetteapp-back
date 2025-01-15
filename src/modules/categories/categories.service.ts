import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ICategory } from '@/interfaces/category.interface';

/**
 * Service qui gère les catégories de recettes
 * On peut récupérer toutes les catégories ou en créer de nouvelles
 * Chaque catégorie doit avoir un nom unique
 */
@Injectable()
export class CategoriesService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Méthode pour récupérer toutes les catégories existantes
   * Utilisée pour le filtrage des recettes et l'affichage des catégories disponibles
   * 
   * @throws {InternalServerErrorException} - Si la récupération échoue
   * @returns {Promise<ICategory[]>} - La liste de toutes les catégories
   */
  async getAllCategories(): Promise<ICategory[]> {
    try {
      // Simple récupération de toutes les catégories sans filtre
      return await this.prismaService.category.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des catégories',
      );
    }
  }

  /**
   * Méthode pour créer une nouvelle catégorie
   * Vérifie d'abord qu'aucune catégorie n'existe avec le même nom
   * 
   * @param createCategoryDto - Les données de la nouvelle catégorie
   * @throws {ConflictException} - Si une catégorie avec ce nom existe déjà
   * @throws {InternalServerErrorException} - Si la création échoue
   * @returns {Promise<ICategory>} - La catégorie créée
   */
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    try {
      // Vérification de l'unicité du nom de la catégorie
      const existingCategory = await this.prismaService.category.findFirst({
        where: {
          name: createCategoryDto.name
        }
      });

      if (existingCategory) {
        throw new ConflictException('Une catégorie avec ce nom existe déjà');
      }

      // Création de la nouvelle catégorie
      return await this.prismaService.category.create({
        data: {
          name: createCategoryDto.name,
          description: createCategoryDto.description
        }
      });
    } catch (error) {
      // On propage l'erreur de conflit si c'est le cas
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Une erreur est survenue lors de la création de la catégorie"
      );
    }
  }
}