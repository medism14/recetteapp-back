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

@Injectable()
export class RecipesService {
  constructor(private prismaService: PrismaService) {}

  async getAllRecipes(filterDto?: FilterRecipeDto) {
    try {
      const where = {};
      let orderBy: any = {};

      if (filterDto?.difficulty) {
        where['difficulty'] = filterDto.difficulty;
      }

      if (filterDto?.categoryId) {
        where['categoryId'] = filterDto.categoryId;
      }

      if (filterDto?.ingredients) {
        where['ingredients'] = {
          contains: filterDto.ingredients,
          mode: 'insensitive',
        };
      }

      switch (filterDto?.sortBy) {
        case 'createdAt':
          orderBy = {
            createdAt: 'desc',
          };
          break;
        case 'name':
          orderBy = {
            name: 'asc',
          };
          break;
        case 'prepTime':
          orderBy = {
            prepTime: 'asc',
          };
          break;
        case 'cookTime':
          orderBy = {
            cookTime: 'asc',
          };
          break;
        default:
          orderBy = {
            createdAt: 'desc',
          };
      }

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
        },
      });

      return recipes;
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des recettes',
      );
    }
  }

  async createRecipe(createRecipeDto: CreateRecipeDto, initiatorId: number) {
    try {
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
          userId: initiatorId,
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

        if (error instanceof UnauthorizedException) {
            throw error;
        }

      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création de la recette',
      );
    }
  }

  async updateRecipe(
    id: number,
    updateRecipeDto: UpdateRecipeDto,
    initiatorId: number,
  ) {
    try {
      const recipe = await this.prismaService.recipe.findUnique({
        where: { id },
      });

      if (!recipe) {
        throw new NotFoundException('Recette non trouvée');
      }

      if (initiatorId !== recipe.userId) {
        throw new UnauthorizedException(
          "Vous n'êtes pas autorisé à modifier cette recette"
        );
      }

      const updatedRecipe = await this.prismaService.recipe.update({
        where: {
          id: id,
        },
        data: {
          name: updateRecipeDto.name,
          description: updateRecipeDto.description,
          prepTime: updateRecipeDto.prepTime,
          cookTime: updateRecipeDto.cookTime,
          difficulty: updateRecipeDto.difficulty,
          ingredients: updateRecipeDto.ingredients,
          instructions: updateRecipeDto.instructions,
          imageUrl: updateRecipeDto.imageUrl,
          categoryId: updateRecipeDto.categoryId,
          userId: initiatorId,
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
      return updatedRecipe;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la mise à jour de la recette',
      );
    }
  }

  async deleteRecipe(id: number, initiatorId: number) {
    try {
      const recipe = await this.prismaService.recipe.findUnique({
        where: { id },
      });

      if (!recipe) {
        throw new NotFoundException('Recette non trouvée');
      }

      if (initiatorId !== recipe.userId) {
        throw new UnauthorizedException(
          "Vous n'êtes pas autorisé à supprimer cette recette"
        );
      }

      await this.prismaService.recipe.delete({
        where: {
          id: id,
        },
      });
      return { message: 'Recette supprimée avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la suppression de la recette',
      );
    }
  }

  async getRecipe(id: number) {
    try {
      const recipe = await this.prismaService.recipe.findUnique({
        where: {
          id: id,
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

      if (!recipe) {
        throw new NotFoundException('Recette non trouvée');
      }

      return recipe;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération de la recette',
      );
    }
  }

  async searchRecipe(text: string) {
    try {
      return await this.prismaService.recipe.findMany({
        where: {
          OR: [
            {
              name: {
                contains: text,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: text,
                mode: 'insensitive',
              },
            },
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la recherche de recettes',
      );
    }
  }
}
