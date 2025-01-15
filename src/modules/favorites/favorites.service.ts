import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async getAllFavorites(userId: number) {
        try {
            const favorites = await this.prismaService.favorite.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    recipe: true
                }
            });
            return favorites;
        } catch (error) {
            throw new Error(`Une erreur est survenue lors de la récupération des favoris`);
        }
    }

    async createFavorite(recipeId: number, initiatorId: number) {
        try {
            const recipe = await this.prismaService.recipe.findUnique({
                where: { id: recipeId }
            });

            if (!recipe) {
                throw new NotFoundException('Recette non trouvée');
            }

            const favorite = await this.prismaService.favorite.create({
                data: {
                    userId: initiatorId,
                    recipeId: recipeId
                },
                include: {
                    recipe: true
                }
            });
            return favorite;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Une erreur est survenue lors de la création du favori`);
        }
    }

    async deleteFavorite(recipeId: number, initiatorId: number) {
        try {
            const favorite = await this.prismaService.favorite.findFirst({
                where: {
                    recipeId: recipeId,
                    userId: initiatorId
                }
            });

            if (!favorite) {
                throw new NotFoundException('Favori non trouvé');
            }

            if (favorite.userId !== initiatorId) {
                throw new UnauthorizedException(
                    "Vous n'êtes pas autorisé à supprimer ce favori"
                );
            }

            await this.prismaService.favorite.delete({
                where: {
                    userId_recipeId: {
                        userId: initiatorId,
                        recipeId: recipeId
                    }
                }
            });
            return { message: 'Favori supprimé avec succès' };
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Une erreur est survenue lors de la suppression du favori`);
        }
    }
}
