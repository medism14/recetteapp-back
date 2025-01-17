import { Difficulty } from '@prisma/client';

/**
 * DTO définissant la structure de réponse d'un favori
 * Utilisé pour standardiser les données renvoyées par l'API
 * Inclut les informations du favori et les détails de la recette associée
 */
export class FavoriteResponseDto {
  id: number;
  userId: number;
  recipeId: number;
  createdAt: Date;

  // Détails de la recette associée au favori
  recipe: {
    id: number;
    name: string;
    description?: string;
    instructions: string;
    prepTime: number;
    cookTime: number;
    difficulty: Difficulty;
    ingredients: string;
    imageUrl: string;
    userId: number;
    categoryId: number;
  };
} 