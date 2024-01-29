import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
jest.mock('./users.service');
describe('UsersController', () => {
  let controller: UsersController;
  let UsersServiceMock: jest.Mocked<UsersService>;
  beforeEach(async () => {
    UsersServiceMock = jest.mocked(UsersService.prototype);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: UsersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the user', async () => {
      const mockResult = { _id: '1' };
      UsersServiceMock.findOne.mockResolvedValueOnce(mockResult as any);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockResult);
    });

    it('should throw 404 if user not found', async () => {
      UsersServiceMock.findOne.mockResolvedValueOnce(null);
      expect(controller.findOne('1')).rejects.toThrow('Not Found');
    });
  });
});
