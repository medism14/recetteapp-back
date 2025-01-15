import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Nom de la recette',
    example: 'Tarte au pommes'
  })
  name: string;

  @ApiProperty({
    description: 'Description de la recette',
    example: 'Une recette très connu et utilisé en chine dans les années 1800'
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
    description: 'URL de l\'image de la recette',
    example: 'https://example.com/tarte-pommes.jpg'
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Identifiant de la catégorie de la recette',
    example: 1
  })
  categoryId: number;
}