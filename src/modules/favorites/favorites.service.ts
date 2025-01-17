import { IFavorite } from '@/interfaces/favorite.interface';
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

/**
 * Service où sont gérés les favoris d'un utilisateur
 * On peut récupérer, ajouter et supprimer des recettes des favoris
 * Chaque méthode vérifie les droits de l'utilisateur
 */
@Injectable()
export class FavoritesService {
    constructor(
        private prismaService: PrismaService
    ) {}

    /**
     * Méthode pour récupérer tous les favoris d'un utilisateur
     * On inclut les détails de la recette et sa catégorie pour l'affichage
     * 
     * @param userId - L'ID de l'utilisateur dont on veut les favoris
     * @throws {InternalServerErrorException} - Si la récupération échoue
     * @returns {Promise<IFavorite[]>} - La liste des favoris avec les recettes complètes
     */
    async getAllFavorites(userId: number): Promise<IFavorite[]> {
        try {
            // Récupération des favoris avec les relations nécessaires
            const favorites = await this.prismaService.favorite.findMany({
                where: { userId },
                include: {
                    recipe: {
                        include: {
                            // On inclut aussi la catégorie de la recette
                            category: true
                        }
                    }
                }
            });
            return favorites;
        } catch (error) {
            throw new InternalServerErrorException(
                `Une erreur est survenue lors de la récupération des favoris`
            );
        }
    }

    /**
     * Méthode pour ajouter une recette aux favoris
     * Vérifie d'abord si la recette existe et si elle n'est pas déjà en favori
     * 
     * @param recipeId - L'ID de la recette à ajouter aux favoris
     * @param userId - L'ID de l'utilisateur qui ajoute le favori
     * @throws {NotFoundException} - Si la recette n'existe pas
     * @throws {UnauthorizedException} - Si la recette est déjà dans les favoris
     * @throws {InternalServerErrorException} - Si l'ajout échoue
     * @returns {Promise<IFavorite>} - Le favori créé avec les détails de la recette
     */
    async createFavorite(recipeId: number, userId: number): Promise<IFavorite> {
        try {
            // Vérification de l'existence de la recette
            const recipe = await this.prismaService.recipe.findUnique({
                where: { id: recipeId }
            });

            if (!recipe) {
                throw new NotFoundException('Recette non trouvée');
            }

            // Vérification si le favori existe déjà
            const existingFavorite = await this.prismaService.favorite.findFirst({
                where: {
                    userId,
                    recipeId
                }
            });

            if (existingFavorite) {
                throw new UnauthorizedException('Cette recette est déjà dans vos favoris');
            }

            // Création du nouveau favori avec les relations
            return this.prismaService.favorite.create({
                data: {
                    userId,
                    recipeId
                },
                include: {
                    recipe: {
                        include: {
                            category: true
                        }
                    }
                }
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Une erreur est survenue lors de la création du favori`
            );
        }
    }

    /**
     * Méthode pour retirer une recette des favoris
     * Vérifie que le favori existe et appartient bien à l'utilisateur
     * 
     * @param recipeId - L'ID de la recette à retirer des favoris
     * @param userId - L'ID de l'utilisateur qui retire le favori
     * @throws {NotFoundException} - Si le favori n'existe pas
     * @throws {UnauthorizedException} - Si l'utilisateur n'est pas autorisé
     * @returns {Promise<{ message: string }>} - Message de confirmation
     */
    async deleteFavorite(recipeId: number, userId: number): Promise<{ message: string }> {
        try {
            // Recherche du favori
            const favorite = await this.prismaService.favorite.findFirst({
                where: {
                    recipeId,
                    userId
                }
            });

            if (!favorite) {
                throw new NotFoundException('Favori non trouvé');
            }

            // Vérification des droits
            if (favorite.userId !== userId) {
                throw new UnauthorizedException(
                    "Vous n'êtes pas autorisé à supprimer ce favori"
                );
            }

            // Suppression du favori
            await this.prismaService.favorite.delete({
                where: {
                    userId_recipeId: {
                        userId,
                        recipeId
                    }
                }
            });

            return { message: 'Favori supprimé avec succès' };
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Une erreur est survenue lors de la suppression du favori`
            );
        }
    }

    /**
     * Méthode pour récupérer les favoris d'un utilisateur spécifique
     * 
     * @param userId - L'ID de l'utilisateur dont on veut récupérer les favoris
     * @throws {NotFoundException} - Si l'utilisateur n'existe pas
     * @throws {InternalServerErrorException} - Si la récupération échoue
     * @returns {Promise<IFavorite[]>} - La liste des favoris de l'utilisateur
     */
    async getFavoritesByUserId(userId: number): Promise<IFavorite[]> {
        try {
            // Vérifier si l'utilisateur existe
            const user = await this.prismaService.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
            }

            // Récupérer les favoris
            const favorites = await this.prismaService.favorite.findMany({
                where: { userId },
                include: {
                    recipe: {
                        include: {
                            category: true,
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });

            return favorites;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Une erreur est survenue lors de la récupération des favoris de l'utilisateur ${userId}`
            );
        }
    }

    /**
     * Méthode pour vérifier si une recette est dans les favoris d'un utilisateur
     * 
     * @param recipeId - L'ID de la recette à vérifier
     * @param userId - L'ID de l'utilisateur
     * @returns {Promise<{ isFavorite: boolean }>} - True si la recette est en favori
     */
    async isFavorite(recipeId: number, userId: number): Promise<{ isFavorite: boolean }> {
        try {
            const favorite = await this.prismaService.favorite.findFirst({
                where: {
                    userId,
                    recipeId
                }
            });

            return { isFavorite: !!favorite };
        } catch (error) {
            throw new InternalServerErrorException(
                `Une erreur est survenue lors de la vérification du favori`
            );
        }
    }
}
