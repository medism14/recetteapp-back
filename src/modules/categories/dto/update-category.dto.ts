import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la mise à jour d'une catégorie
 * Tous les champs sont optionnels car on peut mettre à jour
 * soit le nom, soit la description, soit les deux
 */
export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Le nom de la catégorie',
    example: 'Électronique',
    required: false
  })
  name?: string;

  @ApiProperty({
    description: 'La description de la catégorie', 
    example: 'Produits électroniques et accessoires',
    required: false
  })
  description?: string;
}