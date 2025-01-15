import { Difficulty } from '@prisma/client';

export class FavoriteResponseDto {
  id: number;
  userId: number;
  recipeId: number;
  createdAt: Date;
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