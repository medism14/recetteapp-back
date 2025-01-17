import { Difficulty } from '@prisma/client';

export interface IRecipe {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  ingredients: string;
  image: string;
  userId: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  category?: any;
  user?: any;
}