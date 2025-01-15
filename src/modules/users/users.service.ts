import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from '../../interfaces/user.interface';
import { ApiTags } from '@nestjs/swagger';

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
  async getUserByEmail(email: string): Promise<IUser> {
    try {
      // Recherche l'utilisateur dans la base de données via Prisma
      // en utilisant l'email comme critère unique
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
        // Sélectionne uniquement les champs nécessaires pour la réponse
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          password: true,
        },
      });

      // Si aucun utilisateur n'est trouvé, lance une exception NotFoundException
      if (!user) {
        throw new NotFoundException("Utilisateur non trouvé");
      }

      // Retourne les données de l'utilisateur si trouvé
      return user;
    } catch (error) {
      // Propage l'erreur NotFoundException si c'est le cas
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Pour toute autre erreur, lance une InternalServerErrorException
      throw new InternalServerErrorException(
        "Erreur lors de la récupération de l'utilisateur par email",
      );
    }
  }
}