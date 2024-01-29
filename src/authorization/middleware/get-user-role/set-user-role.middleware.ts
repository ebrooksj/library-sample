import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthorizationService } from '../../authorization.service';
import { APP_CONSTANTS } from '../../../config';

@Injectable()
export class SetUserRoleMiddleware implements NestMiddleware {
  constructor(private readonly authorizationService: AuthorizationService) {}

  async use(req: any, res: any, next: () => void) {
    const userId = Number(req.headers[APP_CONSTANTS.AUTH_HEADER]) ?? null;
    const role = await this.authorizationService.getUserRole(userId);
    req.locals = { role };
    next();
  }
}
