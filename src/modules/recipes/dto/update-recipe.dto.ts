import { Difficulty } from '@prisma/client';

export class UpdateRecipeDto {
  name: string;
  description?: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  ingredients: string;
  imageUrl: string;
  categoryId: number;
} 