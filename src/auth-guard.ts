import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';

// JWT Guard pour filtrer les requêtes et vérifier l'existance des token dans les cookies HttpOnly
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  // Controle d'accès aux routes
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupération de la requête
    const request = context.switchToHttp().getRequest();

    // Autoriser certains endpoints à passer automatiquement (ceux qui en ont pas besoin)
    const pathsAutorises = [
      '/auth/login',
      '/auth/register',
      '/health'
    ];

    // Vérification plus stricte des chemins autorisés
    if (pathsAutorises.some(path => request.path === path)) {
      return true;
    }

    // Renvoie de l'utilisateur s'il n'y a pas de token
    const token = request.cookies['access_token'];
    if (!token) {
      throw new UnauthorizedException('Token non trouvé');
    }

    // Récupération de l'utilisateur en le validant
    try {
      const user = await this.authService.isTokenValid(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
