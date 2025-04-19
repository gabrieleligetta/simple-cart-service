// src/auth/libs/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../user/libs/enums/roles.enum';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const allowed = this.reflector.get<Role[]>(ROLES_KEY, ctx.getHandler());
    if (!allowed || allowed.length === 0) {
      // no roles metadata ⇒ public endpoint
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !allowed.includes(user.role)) {
      throw new ForbiddenException(
        `Requires one of roles: ${allowed.join(', ')}`,
      );
    }
    return true;
  }
}
