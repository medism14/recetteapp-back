import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const pathsAutorises = ['/auth', '/health'];

    if (pathsAutorises.some(path => request.path.startsWith(path))) {
      return true;
    }

    const token = request.cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException('Token non trouvé');
    }

    try {
      const user = await this.authService.isTokenValid(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}