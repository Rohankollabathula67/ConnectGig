import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerk: ReturnType<typeof Clerk>;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not defined in environment variables');
    }
    this.clerk = Clerk({ secretKey });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();

    // Dev bypass: if enabled, accept optional x-dev-user-id header as the requester
    const devBypassEnabled = this.configService.get<string>('DEV_AUTH_BYPASS') === 'true';
    const devUserId = (req.headers['x-dev-user-id'] as string | undefined) || undefined;
    if (devBypassEnabled && devUserId) {
      req.user = { id: devUserId };
      return true;
    }

    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const token = parts[1];

    try {
      const session = await this.clerk.sessions.verifySession(token, token);

      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      req.user = {
        id: session.userId,
        email: undefined,
      };

      return true;
    } catch (err) {
      console.error('Clerk authentication error:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
