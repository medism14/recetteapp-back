import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';

/**
 * Service où l'on gère les recettes 
 * Nous utilisons ici plusieurs fonctions avec prisma pour un accès et une communication avec la bdd
 */
@Injectable()
export class RecipesService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Méthode pour récupérer toutes les recettes existantes
   * 
   * @param filterDto - Contient tous les filtres que l'utilisateur peut appliquer
   * @throws {InternalServerErrorException} - En cas d'erreur avec les requêtes prisma
   * @returns {Promise<RecipeResponseDto[]>} - Un ensemble de recettes avec la catégorie et l'utilisateur
   */
  async getAllRecipes(filterDto?: FilterRecipeDto): Promise<RecipeResponseDto[]> {
    try {
      // Initialisation des objets pour les conditions WHERE et ORDER BY
      const where = {};
      let orderBy: any = {};

      // Application des filtres si présents
      if (filterDto?.difficulty) {
        where['difficulty'] = filterDto.difficulty;
      }

      if (filterDto?.categoryId) {
        where['categoryId'] = filterDto.categoryId;
      }

      // Recherche insensible à la casse dans les ingrédients
      if (filterDto?.ingredients) {
        where['ingredients'] = {
          contains: filterDto.ingredients,
          mode: 'insensitive',
        };
      }

      // Gestion du tri des recettes selon différents critères
      switch (filterDto?.sortBy) {
        case 'createdAt':
          orderBy = { createdAt: 'desc' };
          break;
        case 'name':
          orderBy = { name: 'asc' };
          break;
        case 'prepTime':
          orderBy = { prepTime: 'asc' };
          break;
        case 'cookTime':
          orderBy = { cookTime: 'asc' };
          break;
        default:
          // Par défaut, tri par date de création décroissante
          orderBy = { createdAt: 'desc' };
      }

      // Récupération des recettes avec leurs relations
      const recipes = await this.prismaService.recipe.findMany({
        where,
        orderBy,
        include: {
          category: true,
          user: {
            // On sélectionne uniquement les infos nécessaires de l'utilisateur
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return recipes;
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des recettes',
      );
    }
  }

  /**
   * Méthode pour créer une nouvelle recette
   * 
   * @param createRecipeDto - Les données de la recette à créer
   * @param userId - L'ID de l'utilisateur qui crée la recette
   * @throws {InternalServerErrorException} - Si la création échoue
   * @returns {Promise<RecipeResponseDto>} - La recette créée avec sa catégorie et son créateur
   */
  async createRecipe(createRecipeDto: CreateRecipeDto, userId: number): Promise<RecipeResponseDto> {
    try {
      // Création de la recette avec toutes ses propriétés
      return await this.prismaService.recipe.create({
        data: {
          name: createRecipeDto.name,
          description: createRecipeDto.description,
          prepTime: createRecipeDto.prepTime,
          cookTime: createRecipeDto.cookTime,
          difficulty: createRecipeDto.difficulty,
          ingredients: createRecipeDto.ingredients,
          instructions: createRecipeDto.instructions,
          imageUrl: createRecipeDto.imageUrl,
          categoryId: createRecipeDto.categoryId,
          userId, // Association avec l'utilisateur créateur
        },
        include: {
          // Inclusion des relations pour la réponse
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création de la recette',
      );
    }
  }

  /**
   * Méthode pour modifier une recette existante
   * 
   * @param id - L'ID de la recette à modifier
   * @param updateRecipeDto - Les nouvelles données de la recette
   * @param userId - L'ID de l'utilisateur qui fait la modification
   * @throws {NotFoundException} - Si la recette n'existe pas
   * @throws {UnauthorizedException} - Si l'utilisateur n'est pas le créateur
   * @returns {Promise<RecipeResponseDto>} - La recette modifiée
   */
  async updateRecipe(id: number, updateRecipeDto: UpdateRecipeDto, userId: number): Promise<RecipeResponseDto> {
    // Vérification de l'existence de la recette
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException('Recette non trouvée');
    }

    // Vérification des droits de modification
    if (recipe.userId !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette recette');
    }

    // Mise à jour de la recette avec les nouvelles données
    return this.prismaService.recipe.update({
      where: { id },
      data: updateRecipeDto,
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
  }

  /**
   * Méthode pour supprimer une recette
   * 
   * @param id - L'ID de la recette à supprimer
   * @param userId - L'ID de l'utilisateur qui veut supprimer
   * @throws {NotFoundException} - Si la recette n'existe pas
   * @throws {UnauthorizedException} - Si l'utilisateur n'est pas le créateur
   * @returns {Promise<{ message: string }>} - Message de confirmation
   */
  async deleteRecipe(id: number, userId: number): Promise<{ message: string }> {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException('Recette non trouvée');
    }

    if (recipe.userId !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à supprimer cette recette');
    }

    await this.prismaService.recipe.delete({
      where: { id },
    });

    return { message: 'Recette supprimée avec succès' };
  }

  /**
   * Méthode pour récupérer une recette spécifique
   * 
   * @param id - L'ID de la recette recherchée
   * @throws {NotFoundException} - Si la recette n'existe pas
   * @returns {Promise<RecipeResponseDto>} - La recette avec sa catégorie et son créateur
   */
  async getRecipe(id: number): Promise<RecipeResponseDto> {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id },
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

    if (!recipe) {
      throw new NotFoundException('Recette non trouvée');
    }

    return recipe;
  }

  /**
   * Méthode pour rechercher des recettes par texte
   * La recherche se fait sur le nom, la description et les ingrédients
   * 
   * @param text - Le texte à rechercher
   * @returns {Promise<RecipeResponseDto[]>} - Les recettes qui correspondent à la recherche
   */
  async searchRecipe(text: string): Promise<RecipeResponseDto[]> {
    return this.prismaService.recipe.findMany({
      where: {
        OR: [
          // Recherche insensible à la casse dans plusieurs champs
          { name: { contains: text, mode: 'insensitive' } },
          { description: { contains: text, mode: 'insensitive' } },
          { ingredients: { contains: text, mode: 'insensitive' } },
        ],
      },
      include: {
        // Inclusion des relations nécessaires
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
  }
}
