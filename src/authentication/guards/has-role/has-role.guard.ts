import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticationService } from '../../authentication.service';
import { ROLES_KEY } from '../../decorators/roles/role.decorator';

@Injectable()
export class HasRoleGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Reflectively gets the roles from the handler annotations
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userRole = request.locals?.role ?? null;
    const allowed = !!userRole && allowedRoles.includes(userRole);
    if (!allowed) {
      this.logger.debug(
        `Forbidden access to resource: userRole ${userRole}, allowedRoles ${allowedRoles}`,
      );
    }
    return allowed;
  }
}
