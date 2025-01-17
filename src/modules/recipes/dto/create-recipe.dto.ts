import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Nom de la recette',
    example: 'Tarte aux pommes'
  })
  name: string;

  @ApiProperty({
    description: 'Description de la recette',
    example: 'Une recette très connue et utilisée en chine dans les années 1800'
  })
  description?: string;

  @ApiProperty({
    description: 'Instructions détaillées de la recette',
    example: '1. Préchauffer le four à 180°C\n2. Mélanger les ingrédients...'
  })
  instructions: string;

  @ApiProperty({
    description: 'Temps de préparation en minutes',
    example: 30
  })
  prepTime: number;

  @ApiProperty({
    description: 'Temps de cuisson en minutes',
    example: 45
  })
  cookTime: number;

  @ApiProperty({
    description: 'Niveau de difficulté de la recette',
    enum: Difficulty,
    example: Difficulty.EASY
  })
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Liste des ingrédients nécessaires',
    example: '- 4 pommes\n- 200g de farine\n- 100g de sucre'
  })
  ingredients: string;

  @ApiProperty({
    description: 'Image de la recette en base64',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
  })
  image: string;

  @ApiProperty({
    description: 'Identifiant de la catégorie de la recette',
    example: 1
  })
  categoryId: number;
}