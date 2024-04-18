import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { ExtendedRequest } from '../interfaces/common.interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<ExtendedRequest>();
    const user = request.user;
    this.logger.debug(`Validating role for user: ${user.email}`);
    const hasRole = !!roles.includes(user.role);

    return hasRole;
  }
}
