import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user: User;
  accessToken: string;
}

/** Vérifie le JWT Supabase via l'Authorization header et attache user + token à la request. */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn('Authentication failed: missing authorization token');
      throw new UnauthorizedException('Missing authorization token');
    }

    const user = await this.authService.validateToken(token);

    if (!user) {
      this.logger.warn('Authentication failed: invalid or expired token');
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user and token to request for downstream use
    request.user = user;
    request.accessToken = token;

    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, ...rest] = authHeader.split(' ');
    if (type !== 'Bearer') return null;

    // join au lieu de [0] : évite une troncature silencieuse si le token
    // contenait un espace. trim() car la RFC 7235 autorise plusieurs espaces
    // entre le schéma et le token — sans lui, « Bearer  <jwt> » produisait un
    // token préfixé d'une espace, rejeté par Supabase.
    const token = rest.join(' ').trim();
    return token || null;
  }
}