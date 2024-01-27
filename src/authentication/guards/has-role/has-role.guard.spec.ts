import { Reflector } from '@nestjs/core';
import { Role } from '../../decorators/roles/role.enum';
import { HasRoleGuard } from './has-role.guard';

describe('HasRoleGuard', () => {
  let mockReflector: jest.Mocked<Reflector>;
  let mockGetRequest: jest.Mock;
  let mockContext: jest.Mocked<any>;
  beforeEach(() => {
    mockGetRequest = jest.fn();
    mockReflector = {
      getAllAndOverride: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
    };
    mockContext = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: () =>
        ({
          getRequest: mockGetRequest,
        }) as any,
    };
  });
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(new HasRoleGuard(mockReflector)).toBeDefined();
  });

  it('should be false if the user role is not correct', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce([
      Role.LIBRARIAN.toString(),
    ]);
    const req = { locals: { role: Role.USER.toString() } };
    mockGetRequest.mockReturnValueOnce(req);
    const guard = new HasRoleGuard(mockReflector);

    expect(guard.canActivate(mockContext as any)).toEqual(false);
  });

  it('should be false if the user role is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce([
      Role.LIBRARIAN.toString(),
    ]);
    const req = { locals: {} };
    mockGetRequest.mockReturnValueOnce(req);
    const guard = new HasRoleGuard(mockReflector);

    expect(guard.canActivate(mockContext as any)).toEqual(false);
  });

  it('should be false if the user role is null', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce([
      Role.LIBRARIAN.toString(),
    ]);
    const req = { locals: { role: null } };
    mockGetRequest.mockReturnValueOnce(req);
    const guard = new HasRoleGuard(mockReflector);

    expect(guard.canActivate(mockContext as any)).toEqual(false);
  });

  it('should be true if the user role is correct', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce([Role.USER.toString()]);
    const req = { locals: { role: Role.USER.toString() } };
    mockGetRequest.mockReturnValueOnce(req);
    const guard = new HasRoleGuard(mockReflector);

    expect(guard.canActivate(mockContext as any)).toEqual(true);
  });
});
