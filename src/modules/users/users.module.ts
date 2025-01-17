import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'prisma/prisma.service';

/**
 * Module de gestion des utilisateurs
 * Ce module regroupe toutes les fonctionnalités liées aux utilisateurs
 * Il utilise:
 * - UsersController pour gérer les routes
 * - UsersService pour la logique métier
 * - PrismaService pour l'accès à la base de données
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService]
})
export class UsersModule {}
