import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { PrismaService } from 'prisma/prisma.service';

/**
 * Module de gestion des favoris
 * Configure les dépendances nécessaires:
 * - FavoritesController: Gère les routes API
 * - FavoritesService: Contient la logique métier
 * - PrismaService: Gère l'accès à la base de données
 */
@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService, PrismaService]
})
export class FavoritesModule {}
