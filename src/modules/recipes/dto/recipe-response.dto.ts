import { Difficulty } from '@prisma/client';

/**
 * DTO définissant la structure de réponse d'une recette
 * Utilisé pour standardiser les données renvoyées par l'API
 * Inclut toutes les informations d'une recette ainsi que ses relations
 */
export class RecipeResponseDto {
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
  
  // Relations incluses dans la réponse
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