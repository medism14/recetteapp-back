import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ICategory } from '@/interfaces/category.interface';

/**
 * Service de gestion des catégories de recettes
 * Fournit les fonctionnalités de base pour gérer les catégories:
 * - Récupération de toutes les catégories
 * - Création de nouvelles catégories avec vérification d'unicité
 */
@Injectable()
export class CategoriesService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Récupère la liste complète des catégories
   * Utilisé pour le filtrage des recettes et l'affichage des options disponibles
   * 
   * @returns Liste de toutes les catégories existantes
   * @throws InternalServerErrorException si la récupération échoue
   */
  async getAllCategories(): Promise<ICategory[]> {
    try {
      return await this.prismaService.category.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des catégories',
      );
    }
  }

  /**
   * Crée une nouvelle catégorie
   * 
   * @param createCategoryDto - Données de la nouvelle catégorie (nom et description optionnelle)
   * @returns La catégorie nouvellement créée
   * @throws ConflictException si une catégorie avec le même nom existe déjà
   * @throws InternalServerErrorException si la création échoue
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