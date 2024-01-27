import { APP_CONSTANTS } from '../../../config';
import { AuthenticationService } from '../../authentication.service';
import { Role } from '../../decorators/roles/role.enum';
import { SetUserRoleMiddleware } from './set-user-role.middleware';

jest.mock('../authentication.service');

describe('UserRoleMiddleware', () => {
  let mockAuthenticationService: jest.Mocked<AuthenticationService>;
  beforeEach(() => {
    mockAuthenticationService = jest.mocked(AuthenticationService.prototype);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(new SetUserRoleMiddleware(mockAuthenticationService)).toBeDefined();
  });

  it('should call seed role data into the req object', async () => {
    mockAuthenticationService.getUserRole.mockResolvedValue(
      Role.LIBRARIAN.toString(),
    );
    const middleware = new SetUserRoleMiddleware(mockAuthenticationService);
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
    mockAuthenticationService.getUserRole.mockResolvedValue(null);
    const middleware = new SetUserRoleMiddleware(mockAuthenticationService);
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
