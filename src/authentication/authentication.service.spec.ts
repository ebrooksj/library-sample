import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { mockModelProviderFactory } from '../../test/utils/model.mock';
import { UserRole } from './entities/role.entity';
import { Role } from './decorators/roles/role.enum';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  const { mock: UserRoleModelMock, provider: UserRoleModelProvider } =
    mockModelProviderFactory(UserRole.name);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticationService, UserRoleModelProvider],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRole', () => {
    it('should return null if no user id is provided', async () => {
      const result = await service.getUserRole(null);
      expect(result).toBeNull();
    });

    it('should return the user role if the user id is provided', async () => {
      const expectedRole = Role.USER.toString();
      const mockUserRole = {
        role: expectedRole,
      };
      UserRoleModelMock.findOne.mockResolvedValueOnce(mockUserRole);
      const result = await service.getUserRole(1);
      expect(result).toEqual(expectedRole);
    });
  });

  describe('setUserRoleByUserId', () => {
    it('should return an error if the user role has already been set', async () => {
      const expectedRole = Role.USER.toString();
      const mockUserRole = {
        role: expectedRole,
      };
      UserRoleModelMock.findOne.mockResolvedValueOnce(mockUserRole);
      const result = await service.setUserRoleByUserId(1, Role.USER);
      expect(result).toBeInstanceOf(Error);
    });

    it('should return an error if there is an error creating the role', async () => {
      UserRoleModelMock.findOne.mockResolvedValueOnce(null);
      const mockError = new Error('User');
      UserRoleModelMock.create.mockRejectedValueOnce(mockError);
      const result = await service.setUserRoleByUserId(1, Role.USER);
      expect(result).toBeInstanceOf(Error);
    });

    it('should return the user role if the user role has not been set and there is no error creating the role', async () => {
      UserRoleModelMock.findOne.mockResolvedValueOnce(null);
      const mockCreatedUserRole = {
        id: 1,
        role: Role.USER.toString(),
        userId: 1,
      };
      UserRoleModelMock.create.mockResolvedValueOnce(mockCreatedUserRole);
      const result = await service.setUserRoleByUserId(1, Role.USER);
      expect(result).toEqual(mockCreatedUserRole);
    });
  });
});
