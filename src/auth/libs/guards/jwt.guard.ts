import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { UserRequest } from '../requests/user.request';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If Passport threw an error or no user is available, handle them
    if (err || !user) {
      // info holds specific error info from JWT validation
      if (info instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (info instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw err || new UnauthorizedException();
    }

    // For HTTP context, attach the user to the request
    const request = context.switchToHttp().getRequest<UserRequest>();
    request.user = user;

    return user; // Must return the user for further usage in the pipeline
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // if the handler or controller is marked @Public(), skip auth entirely
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // otherwise proceed with normal JWT check
    return (await super.canActivate(context)) as boolean;
  }
}
