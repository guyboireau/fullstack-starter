import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Double-submit cookie CSRF guard.
 *
 * - Skips validation for safe methods (GET, HEAD, OPTIONS).
 * - Expects the CSRF secret in the `csrf-secret` cookie (set by middleware in main.ts).
 * - Expects the matching token in the `X-CSRF-Token` request header.
 *
 * This pattern works because a cross-origin attacker cannot read the cookie
 * and therefore cannot forge the header value.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (this.safeMethods.includes(request.method)) {
      return true;
    }

    const secret = request.cookies?.['csrf-secret'];
    const token = request.headers['x-csrf-token'];

    if (!secret || !token || secret !== token) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    return true;
  }
}
