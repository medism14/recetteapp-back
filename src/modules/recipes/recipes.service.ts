import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { Difficulty } from '@prisma/client';

/**
 * Service de gestion des recettes
 * Ce service gère toutes les opérations CRUD et la logique métier liée aux recettes
 * Il utilise Prisma comme ORM pour interagir avec la base de données
 */
@Injectable()
export class RecipesService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Récupère toutes les recettes avec possibilité de filtrage et tri
   * 
   * @param filters - Objet contenant les critères de filtrage et tri
   *   - difficulty: Niveau de difficulté de la recette
   *   - categoryId: Filtre par catégorie
   *   - ingredients: Recherche dans les ingrédients
   *   - sortBy: Champ de tri (createdAt, name, prepTime, cookTime)
   * 
   * @returns Liste des recettes filtrées avec leurs relations (catégorie, utilisateur, favoris)
   * @throws InternalServerErrorException si la requête échoue
   */
  async getAllRecipes(filters: {
    difficulty?: Difficulty;
    categoryId?: number;
    ingredients?: string;
    sortBy?: 'createdAt' | 'name' | 'prepTime' | 'cookTime';
  }): Promise<RecipeResponseDto[]> {
    try {
      const where: any = {};
      let orderBy: any = { createdAt: 'desc' };

      if (filters.difficulty) {
        where.difficulty = filters.difficulty;
      }

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.ingredients) {
        where.ingredients = {
          contains: filters.ingredients,
          mode: 'insensitive',
        };
      }

      // Gestion du tri
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'name':
            orderBy = { name: 'asc' };
            break;
          case 'prepTime':
            orderBy = { prepTime: 'asc' };
            break;
          case 'cookTime':
            orderBy = { cookTime: 'asc' };
            break;
          case 'createdAt':
          default:
            orderBy = { createdAt: 'desc' };
            break;
        }
      }

      // Récupération des recettes avec leurs relations
      const recipes = await this.prismaService.recipe.findMany({
        where,
        orderBy,
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
          favorites: true,
        },
      });

      return recipes;
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes:', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des recettes',
      );
    }
  }

  /**
   * Crée une nouvelle recette dans la base de données
   * 
   * @param createRecipeDto - Données de la nouvelle recette
   * @param userId - ID de l'utilisateur créant la recette
   * 
   * @returns La recette créée avec ses relations
   * @throws BadRequestException si l'image n'est pas au format base64 valide
   * @throws InternalServerErrorException si la création échoue
   */
  async createRecipe(createRecipeDto: CreateRecipeDto, userId: number): Promise<RecipeResponseDto> {
    try {
      // Validation basique du format base64

      if (!this.isValidBase64Image(createRecipeDto.image)) {
        throw new BadRequestException('Format d\'image invalide');
      }

      return await this.prismaService.recipe.create({
        data: {
          name: createRecipeDto.name,
          description: createRecipeDto.description,
          prepTime: createRecipeDto.prepTime,
          cookTime: createRecipeDto.cookTime,
          difficulty: createRecipeDto.difficulty,
          ingredients: createRecipeDto.ingredients,
          instructions: createRecipeDto.instructions,
          image: createRecipeDto.image,
          categoryId: createRecipeDto.categoryId,
          userId,
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
    } catch (error) {

      console.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création de la recette',
      );
    }
  }

  /**
   * Vérifie si une chaîne est une image base64 valide
   * Accepte les formats: jpeg, jpg, png, gif
   * 
   * @param base64String - Chaîne à valider
   * @returns true si le format est valide, false sinon
   */
  private isValidBase64Image(base64String: string): boolean {
    try {
      // Vérifie si la chaîne est définie
      if (!base64String) {
        return false;
      }

      // Vérifie le format général
      const matches = base64String.match(/^data:image\/(jpeg|jpg|png|gif);base64,/);
      if (!matches) {
        return false;
      }

      // Récupère la partie base64 après le préfixe
      const base64Data = base64String.split(',')[1];
      if (!base64Data) {
        return false;
      }

      // Vérifie que c'est un base64 valide
      const buffer = Buffer.from(base64Data, 'base64');
      return buffer.length > 0;
    } catch (e) {
      return false;
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

  /**
   * Méthode pour récupérer les recettes d'un utilisateur
   * 
   * @param userId - L'ID de l'utilisateur dont on veut les recettes
   * @returns {Promise<RecipeResponseDto[]>} - Les recettes de l'utilisateur
   */
  async getRecipesByUserId(userId: number): Promise<RecipeResponseDto[]> {
    try {
      return await this.prismaService.recipe.findMany({
        where: {
          userId: userId,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des recettes',
      );
    }
  }
}
