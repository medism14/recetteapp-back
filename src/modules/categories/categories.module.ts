import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'prisma/prisma.service';

/**
 * Module de gestion des catégories
 * Configure les dépendances nécessaires:
 * - CategoriesController: Gère les routes API
 * - CategoriesService: Contient la logique métier
 * - PrismaService: Gère l'accès à la base de données
 */
@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService]
})
export class CategoriesModule {}
