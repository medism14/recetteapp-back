import { Difficulty } from '@prisma/client';

export class RecipeResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
  };
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
} 