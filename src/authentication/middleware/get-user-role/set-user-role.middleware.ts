import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthenticationService } from '../../authentication.service';
import { APP_CONSTANTS } from '../../../config';

@Injectable()
export class SetUserRoleMiddleware implements NestMiddleware {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async use(req: any, res: any, next: () => void) {
    const userId = req.headers[APP_CONSTANTS.AUTH_HEADER] ?? null;
    const role = await this.authenticationService.getUserRole(userId);
    req.locals = { role };
    next();
  }
}
