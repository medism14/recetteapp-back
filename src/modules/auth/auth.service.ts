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
import { PrismaService } from '@prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginInfoDto } from './dto/login-info.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private userService: UsersService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    if (createUserDto.password.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      const existingUser = await this.userService.getUserByEmail(createUserDto.email);

      if (existingUser) {
        throw new ConflictException("L'email est déjà utilisé");
      }

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
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la création du compte');
    }
  }

  async login(loginInfoDto: LoginInfoDto) {
    try {
      const user = await this.userService.getUserByEmail(loginInfoDto.email);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const isPasswordValid = await bcrypt.compare(
        loginInfoDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Le mot de passe est incorrect');
      }

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

  async isTokenValid(accessToken: string) {
    try {
      const decoded = this.jwtService.verify(accessToken);

      const user = await this.userService.getUserByEmail(decoded.email);

      if (!user) {
        throw new NotFoundException("L'utilisateur n'a pas été trouvé");
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

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

  generateAccessToken(email: string) {
    const payload = { email };
    return this.jwtService.sign(payload);
  }
}
