import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Catégories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ 
    summary: 'Récupérer toutes les catégories',
    description: 'Retourne la liste de toutes les catégories disponibles'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des catégories récupérée avec succès'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erreur serveur lors de la récupération des catégories'
  })
  @Get()
  async getAllCategories() {
    return await this.categoriesService.getAllCategories();
  }

  @ApiOperation({ 
    summary: 'Créer une nouvelle catégorie',
    description: 'Crée une nouvelle catégorie de recettes'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Catégorie créée avec succès'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Une catégorie avec ce nom existe déjà'
  })
  @ApiBody({ 
    type: CreateCategoryDto,
    description: 'Données de la nouvelle catégorie'
  })
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createCategoryDto);
  }
}
