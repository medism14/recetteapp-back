import { Body, Controller, Post, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginInfoDto } from './dto/login-info.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ 
    summary: 'Inscription d\'un nouvel utilisateur',
    description: 'Crée un nouveau compte utilisateur et retourne un token d\'authentification'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilisateur créé avec succès',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'L\'email est déjà utilisé'
  })
  @ApiBody({ 
    type: CreateUserDto,
    description: 'Informations d\'inscription de l\'utilisateur'
  })
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!createUserDto.email || !createUserDto.password || !createUserDto.firstName || !createUserDto.lastName) {
      throw new BadRequestException('Tous les champs sont requis');
    }
    const { accessToken, user } = await this.authService.register(createUserDto);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'PRODUCTION',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      statusCode: 201,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @ApiOperation({ 
    summary: 'Connexion utilisateur',
    description: 'Authentifie l\'utilisateur et retourne un token d\'accès'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Email ou mot de passe incorrect'
  })
  @ApiBody({ 
    type: LoginInfoDto,
    description: 'Identifiants de connexion'
  })
  @Post('login')
  async login(
    @Body() loginInfoDto: LoginInfoDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!loginInfoDto.email || !loginInfoDto.password) {
      throw new BadRequestException('Email et mot de passe requis');
    }
    const { accessToken, user } = await this.authService.login(loginInfoDto);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'PRODUCTION',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      statusCode: 200,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @ApiOperation({ 
    summary: 'Déconnexion',
    description: 'Déconnecte l\'utilisateur en supprimant le cookie d\'authentification'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Déconnexion réussie'
  })
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      statusCode: 200,
      message: 'Déconnexion réussie',
    };
  }
}