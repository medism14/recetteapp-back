import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Le nom de la catégorie',
    example: 'Électronique'
  })
  name: string;

  @ApiProperty({
    description: 'La description de la catégorie',
    example: 'Produits électroniques et accessoires',
    required: false
  })
  description?: string;
}