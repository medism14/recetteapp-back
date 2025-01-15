import { ApiProperty } from '@nestjs/swagger';

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