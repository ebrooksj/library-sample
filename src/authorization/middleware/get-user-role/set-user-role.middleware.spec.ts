import { APP_CONSTANTS } from '../../../config';
import { AuthorizationService } from '../../authorization.service';
import { Role } from '../../decorators/roles/role.enum';
import { SetUserRoleMiddleware } from './set-user-role.middleware';

jest.mock('../../authorization.service');

describe('UserRoleMiddleware', () => {
  let mockAuthorizationService: jest.Mocked<AuthorizationService>;
  beforeEach(() => {
    mockAuthorizationService = jest.mocked(AuthorizationService.prototype);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(new SetUserRoleMiddleware(mockAuthorizationService)).toBeDefined();
  });

  it('should call seed role data into the req object', async () => {
    mockAuthorizationService.getUserRole.mockResolvedValue(
      Role.LIBRARIAN.toString(),
    );
    const middleware = new SetUserRoleMiddleware(mockAuthorizationService);
    const req = { headers: { [APP_CONSTANTS.AUTH_HEADER]: 1 } } as {
      [key: string]: any;
    };
    const next = jest.fn();
    await middleware.use(req, null, next);
    expect(req.locals).toBeDefined();
    expect(req.locals.role).toEqual(Role.LIBRARIAN.toString());
    expect(next).toHaveBeenCalled();
  });

  it('should surive a missing auth header', async () => {
    mockAuthorizationService.getUserRole.mockResolvedValue(null);
    const middleware = new SetUserRoleMiddleware(mockAuthorizationService);
    const req = { headers: {} } as {
      [key: string]: any;
    };
    const next = jest.fn();
    await middleware.use(req, null, next);
    expect(req.locals).toBeDefined();
    expect(req.locals.role).toEqual(null);
    expect(next).toHaveBeenCalled();
  });
});
