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

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  getAllRecipes(@Query() filterDto?: FilterRecipeDto) {
    return this.recipesService.getAllRecipes(filterDto);
  }

  @Post()
  createRecipe(@Req() req: Request, @Body() createRecipeDto: CreateRecipeDto) {
    const initiatorId = req.user['id'];
    return this.recipesService.createRecipe(createRecipeDto, initiatorId);
  }

  @Put(':id')
  updateRecipe(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    const initiatorId = req.user['id'];
    return this.recipesService.updateRecipe(id, updateRecipeDto, initiatorId);
  }

  @Delete(':id')
  deleteRecipe(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const initiatorId = req.user['id'];
    return this.recipesService.deleteRecipe(id, initiatorId);
  }

  @Get(':id')
  getRecipe(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.getRecipe(id);
  }

  @Get('search/:text')
  searchRecipe(@Param('text') text: string) {
    return this.recipesService.searchRecipe(text);
  }
}
