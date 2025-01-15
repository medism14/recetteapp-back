import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getAllFavorites(@Req() req: Request) {
    const initiatorId = req.user['id'];
    return this.favoritesService.getAllFavorites(initiatorId);
  }

  @Post(':recipeId')
  createFavorite(
    @Req() req: Request,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    const initiatorId = req.user['id'];
    return this.favoritesService.createFavorite(recipeId, initiatorId);
  }

  @Delete(':recipeId')
  deleteFavorite(
    @Req() req: Request,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    const initiatorId = req.user['id'];
    return this.favoritesService.deleteFavorite(recipeId, initiatorId);
  }
}
