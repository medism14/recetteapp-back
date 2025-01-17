import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';

@ApiTags('Recettes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @ApiOperation({ summary: 'Récupérer toutes les recettes avec filtres optionnels' })
  @ApiResponse({ status: 200, description: 'Liste des recettes récupérée avec succès' })
  @ApiResponse({ status: 500, description: 'Erreur serveur lors de la récupération' })
  @ApiQuery({ type: FilterRecipeDto, required: false })
  @Get()
  getAllRecipes(
    @Query('difficulty') difficulty?: string,
    @Query('categoryId') categoryId?: string,
    @Query('ingredients') ingredients?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.recipesService.getAllRecipes({
      difficulty: difficulty as Difficulty,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      ingredients,
      sortBy: sortBy as 'createdAt' | 'name' | 'prepTime' | 'cookTime',
    });
  }

  @ApiOperation({ summary: 'Créer une nouvelle recette' })
  @ApiResponse({ status: 201, description: 'Recette créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBody({ type: CreateRecipeDto })
  @Post()
  createRecipe(@Req() req: Request, @Body() createRecipeDto: CreateRecipeDto) {

    const initiatorId = req.user['id'];
    return this.recipesService.createRecipe(createRecipeDto, initiatorId);
  }

  @ApiOperation({ summary: 'Mettre à jour une recette existante' })
  @ApiResponse({ status: 200, description: 'Recette mise à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la recette à modifier' })
  @ApiBody({ type: UpdateRecipeDto })
  @Put(':id')
  updateRecipe(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    const initiatorId = req.user['id'];
    return this.recipesService.updateRecipe(id, updateRecipeDto, initiatorId);
  }

  @ApiOperation({ summary: 'Supprimer une recette' })
  @ApiResponse({ status: 200, description: 'Recette supprimée avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la recette à supprimer' })
  @Delete(':id')
  deleteRecipe(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const initiatorId = req.user['id'];
    return this.recipesService.deleteRecipe(id, initiatorId);
  }

  @ApiOperation({ summary: 'Récupérer une recette par son ID' })
  @ApiResponse({ status: 200, description: 'Recette trouvée avec succès' })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la recette à récupérer' })
  @Get(':id')
  getRecipe(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.getRecipe(id);
  }

  @ApiOperation({ summary: 'Rechercher des recettes par texte' })
  @ApiResponse({ status: 200, description: 'Recherche effectuée avec succès' })
  @ApiParam({ name: 'text', description: 'Texte à rechercher dans les recettes' })
  @Get('search/:text')
  searchRecipe(@Param('text') text: string) {
    return this.recipesService.searchRecipe(text);
  }

  @ApiOperation({ summary: 'Récupérer les recettes d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Recettes trouvées avec succès' })
  @ApiResponse({ status: 500, description: 'Erreur serveur' })
  @Get('user/recipe')
  getUserRecipes(@Req() req: Request) {
    const userId = req.user['id'];
    return this.recipesService.getRecipesByUserId(userId);
  }
}
