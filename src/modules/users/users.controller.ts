import { Controller, Get, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { IUser } from '../../interfaces/user.interface';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Récupérer l\'utilisateur connecté' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retourne les informations de l\'utilisateur connecté',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé, token manquant ou invalide'
  })
  @Get()
  async getUser(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ 
    summary: 'Récupérer un utilisateur par son email',
    description: 'Retourne les informations d\'un utilisateur en fonction de son adresse email'
  })
  @ApiResponse({
    status: 200,
    description: 'Informations de l\'utilisateur retournées avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé avec cet email'
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur lors de la récupération'
  })
  @ApiParam({
    name: 'email',
    description: 'Adresse email de l\'utilisateur à rechercher',
    example: 'user@example.com',
    type: 'string'
  })
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<IUser> {
    return this.usersService.getUserByEmail(email);
  }

  @ApiOperation({ 
    summary: 'Récupérer tous les utilisateurs',
    description: 'Retourne la liste de tous les utilisateurs enregistrés'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs retournée avec succès',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur lors de la récupération'
  })
  @Get('all')
  async getAllUsers(): Promise<IUser[]> {
    return this.usersService.getAllUsers();
  }
}