import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginInfoDto } from './dto/login-info.dto';
import { IUser } from '@/interfaces/user.interface';
import { AuthInfoDto } from './dto/auth-info.dto';

/**
 * Service qui gère toute l'authentification des utilisateurs
 * Inscription, connexion, vérification de token etc...
 * Utilise JWT pour la gestion des tokens et bcrypt pour le hashage des mots de passe
 */
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private userService: UsersService,
  ) {}

  /**
   * Méthode pour inscrire un nouvel utilisateur
   * Vérifie la validité du mot de passe et l'unicité de l'email
   * 
   * @param createUserDto - Les données du nouvel utilisateur
   * @throws {BadRequestException} - Si le mot de passe est trop court
   * @throws {ConflictException} - Si l'email est déjà utilisé
   * @returns {Promise<AuthInfoDto>} - Token d'accès et infos de l'utilisateur
   */
  async register(createUserDto: CreateUserDto): Promise<AuthInfoDto> {
    try {
      // Vérification de la longueur du mot de passe
      if (createUserDto.password.length < 6) {
        throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Vérification si l'email existe déjà
      const existingUser = await this.userService.getUserByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException("L'email est déjà utilisé");
      }

      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Création de l'utilisateur
      const newUser = await this.prismaService.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        },
      });

      const accessToken = this.generateAccessToken(newUser.email);
      return { accessToken, user: newUser };

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la création du compte: ' + error.message
      );
    }
  }

  /**
   * Méthode pour connecter un utilisateur existant
   * Vérifie l'existence de l'utilisateur et la validité du mot de passe
   * 
   * @param loginInfoDto - Email et mot de passe de connexion
   * @throws {NotFoundException} - Si l'utilisateur n'existe pas
   * @throws {UnauthorizedException} - Si le mot de passe est incorrect
   * @returns {Promise<AuthInfoDto>} - Token d'accès et infos de l'utilisateur
   */
  async login(loginInfoDto: LoginInfoDto): Promise<AuthInfoDto> {
    try {
      // Recherche de l'utilisateur par email
      const user = await this.userService.getUserByEmail(loginInfoDto.email);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(
        loginInfoDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Le mot de passe est incorrect');
      }

      // Génération du token et envoi des infos
      const accessToken = this.generateAccessToken(loginInfoDto.email);
      return { accessToken, user };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la connexion');
    }
  }

  /**
   * Méthode pour vérifier la validité d'un token
   * Utilisée par le guard d'authentification
   * 
   * @param accessToken - Le token JWT à vérifier
   * @throws {UnauthorizedException} - Si le token est invalide ou expiré
   * @throws {NotFoundException} - Si l'utilisateur n'existe plus
   * @returns {Promise<IUser>} - Les informations de l'utilisateur authentifié
   */
  async isTokenValid(accessToken: string): Promise<IUser> {
    try {
      // Décodage du token
      const decoded = this.jwtService.verify(accessToken);

      // Vérification de l'existence de l'utilisateur
      const user = await this.userService.getUserByEmail(decoded.email);

      if (!user) {
        throw new NotFoundException("L'utilisateur n'a pas été trouvé");
      }

      const { password, ...userWithoutPass } = user;

      return userWithoutPass;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Gestion des différentes erreurs JWT
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token invalide');
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expiré');
      }

      throw new InternalServerErrorException(
        "Erreur lors de la vérification de l'utilisateur",
      );
    }
  }

  /**
   * Méthode utilitaire pour générer un token JWT
   * 
   * @param email - L'email de l'utilisateur à encoder dans le token
   * @returns {string} - Le token JWT généré
   */
  generateAccessToken(email: string): string {
    const payload = { email };
    return this.jwtService.sign(payload);
  }
}
