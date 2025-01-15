import { Difficulty } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class FilterRecipeDto {
  @ApiProperty({
    description: 'Niveau de difficulté de la recette',
    enum: Difficulty,
    required: false,
    example: Difficulty.EASY
  })
  difficulty?: Difficulty;

  @ApiProperty({
    description: 'Identifiant de la catégorie pour filtrer les recettes',
    required: false,
    example: 1
  })
  categoryId?: number;

  @ApiProperty({
    description: 'Filtrer les recettes par ingrédients (recherche insensible à la casse)',
    required: false,
    example: 'pommes'
  })
  ingredients?: string;

  @ApiProperty({
    description: 'Trier les recettes par un champ spécifique',
    enum: ['createdAt', 'name', 'prepTime', 'cookTime'],
    required: false,
    example: 'createdAt'
  })
  sortBy?: 'createdAt' | 'name' | 'prepTime' | 'cookTime';
}