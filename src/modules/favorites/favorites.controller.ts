import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Favoris')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @ApiOperation({ summary: 'Récupérer tous les favoris de l\'utilisateur connecté' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des favoris récupérée avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @Get()
  getAllFavorites(@Req() req: Request) {
    const userId = req.user['id'];
    return this.favoritesService.getAllFavorites(userId);
  }

  @ApiOperation({ summary: 'Ajouter une recette aux favoris' })
  @ApiResponse({ status: 201, description: 'Favori ajouté avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Recette non trouvée' })
  @ApiResponse({ status: 409, description: 'La recette est déjà dans les favoris' })
  @ApiParam({ 
    name: 'recipeId', 
    description: 'ID de la recette à ajouter aux favoris',
    type: 'number' 
  })
  @Post(':recipeId')
  createFavorite(
    @Req() req: Request,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    const userId = req.user['id'];
    return this.favoritesService.createFavorite(recipeId, userId);
  }

  @ApiOperation({ summary: 'Supprimer une recette des favoris' })
  @ApiResponse({ status: 200, description: 'Favori supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Favori non trouvé' })
  @ApiParam({ 
    name: 'recipeId', 
    description: 'ID de la recette à retirer des favoris',
    type: 'number' 
  })
  @Delete(':recipeId')
  deleteFavorite(
    @Req() req: Request,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    const userId = req.user['id'];
    return this.favoritesService.deleteFavorite(recipeId, userId);
  }
}
