import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { APP_CONSTANTS } from '../../../config';

export const UserAPIToken = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.headers[APP_CONSTANTS.AUTH_HEADER];
  },
);
