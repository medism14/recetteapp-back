import { Controller, Post, Body, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginInfoDto } from './dto/login-info.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { password, ...userWithoutPassword } = user;
    return {
      statusCode: HttpStatus.CREATED,
      data: userWithoutPassword,
    };
  }

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { password, ...userWithoutPassword } = user;
    return {
      statusCode: HttpStatus.OK,
      data: userWithoutPassword,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Déconnexion réussie',
    };
  }
}