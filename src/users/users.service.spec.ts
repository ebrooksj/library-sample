import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { mockModelProviderFactory } from '../../test/utils/model.mock';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  let { mock: UserModelMock, provider: UserModelProvider } =
    mockModelProviderFactory(User.name);
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UserModelProvider],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the user', async () => {
      const mockResult = { _id: '1' };
      UserModelMock.findOne.mockResolvedValueOnce(mockResult as any);
      const result = await service.findOne(1);
      expect(result).toEqual(mockResult);
    });

    it('should return null if user is null', async () => {
      UserModelMock.findOne.mockResolvedValueOnce(null);
      const result = await service.findOne(1);
      expect(result).toEqual(null);
    });
  });
});
