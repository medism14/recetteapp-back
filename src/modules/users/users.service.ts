import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from '../../interfaces/user.interface';

/**
 * Service responsable de la gestion des utilisateurs
 * Ce service utilise Prisma comme ORM pour interagir avec la base de données
 * et gérer toutes les opérations liées aux utilisateurs
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère un utilisateur à partir de son adresse email
   * 
   * @param email - L'adresse email de l'utilisateur à rechercher
   * @returns Promise<IUser | null> - Retourne l'utilisateur trouvé ou null si aucun utilisateur n'existe
   * @throws InternalServerErrorException - En cas d'erreur lors de l'accès à la base de données
   * 
   * @example
   * // Récupérer un utilisateur
   * const user = await userService.getUserByEmail('user@example.com');
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          password: true,
        },
      });
    } catch (error) {
      console.error('Erreur Prisma:', error);
      throw new InternalServerErrorException(
        `Erreur base de données: ${error.message}`
      );
    }
  }

  /**
   * Récupère la liste complète des utilisateurs
   * 
   * @returns Promise<IUser[]> - Retourne un tableau contenant tous les utilisateurs
   * @throws InternalServerErrorException - En cas d'erreur lors de l'accès à la base de données
   * 
   * @example
   * // Récupérer tous les utilisateurs
   * const users = await userService.getAllUsers();
   */
  async getAllUsers(): Promise<IUser[]> {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error('Erreur Prisma:', error);
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des utilisateurs: ${error.message}`
      );
    }
  }
}