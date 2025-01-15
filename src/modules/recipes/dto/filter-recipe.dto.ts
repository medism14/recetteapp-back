import { Difficulty } from '@prisma/client';

export class FilterRecipeDto {
  difficulty?: Difficulty;
  categoryId?: number;
  ingredients?: string;
  sortBy?: 'createdAt' | 'name' | 'prepTime' | 'cookTime';
} 