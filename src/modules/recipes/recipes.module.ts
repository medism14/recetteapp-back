import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { PrismaService } from 'prisma/prisma.service';

/**
 * Module de gestion des recettes
 * Configure les dépendances nécessaires pour la gestion des recettes:
 * - RecipesController: Gère les routes et requêtes HTTP
 * - RecipesService: Contient la logique métier
 * - PrismaService: Permet l'accès à la base de données
 */
@Module({
  controllers: [RecipesController],
  providers: [RecipesService, PrismaService]
})
export class RecipesModule {}
