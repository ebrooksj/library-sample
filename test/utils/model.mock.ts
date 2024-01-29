import { jest } from '@jest/globals';
import { getModelToken } from '@nestjs/mongoose';

const modelMock = {
  findOne: jest.fn<() => Promise<any>>().mockReturnThis(),
  create: jest.fn<() => Promise<any>>().mockReturnThis(),
  find: jest.fn<() => Promise<any>>().mockReturnThis(),
  save: jest.fn<() => Promise<any>>().mockReturnThis(),
  delete: jest.fn<() => Promise<any>>().mockReturnThis(),
  deleteOne: jest.fn<() => Promise<any>>().mockReturnThis(),
  populate: jest.fn<() => Promise<any>>().mockReturnThis(),
  updateOne: jest.fn<() => Promise<any>>().mockReturnThis(),
};

const mockModelProviderFactory = (provide: string) => {
  const mock = { ...modelMock };
  const provider = {
    useValue: mock,
    provide: getModelToken(provide),
  };

  return { mock, provider };
};

export { mockModelProviderFactory };
