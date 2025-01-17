import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from '../../interfaces/user.interface';

/**
 * Service responsable de la gestion des utilisateurs
 * Grâce à prisma pour communiquer avec notre base de donnée
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère un utilisateur à partir de son adresse email
   * 
   * @param email - L'adresse email de l'utilisateur à rechercher
   * @throws {NotFoundException} Si aucun utilisateur n'est trouvé avec cet email
   * @throws {InternalServerErrorException} En cas d'erreur lors de l'accès à la base de données
   * @returns {Promise<IUser>} Les informations de l'utilisateur trouvé
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