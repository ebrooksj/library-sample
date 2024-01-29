import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockModelProviderFactory } from '../../test/utils/model.mock';
import { UsersService } from '../users/users.service';
import { BooksService } from './books.service';
import {
  BookCheckout,
  BookCheckoutStatus,
} from './entities/book-checkout.entity';
import { Book, BookStatus } from './entities/book.entity';

jest.mock('../users/users.service');
describe('BooksService', () => {
  let service: BooksService;
  // jest.spyOn(Logger, 'log');
  const { mock: BookModelMock, provider: BookModelProvider } =
    mockModelProviderFactory(Book.name);
  const { mock: BookCheckoutModelMock, provider: BookCheckoutModelProvider } =
    mockModelProviderFactory(BookCheckout.name);

  let UserServiceMock: jest.Mocked<UsersService>;
  beforeEach(async () => {
    UserServiceMock = jest.mocked(UsersService.prototype);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        ConfigService,
        BookModelProvider,
        BookCheckoutModelProvider,
        {
          provide: UsersService,
          useValue: UserServiceMock,
        },
      ],
    }).compile();

    UserServiceMock.findOne.mockResolvedValue({
      userId: 2,
      name: {
        first: 'bob',
        last: 'billy',
      },
      email: 'email@email.com',
    } as any);
    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should return an error if the user does not exist', async () => {
      UserServiceMock.findOne.mockResolvedValueOnce(null);
      const result = await service.checkout({ isbn: '1234567890123' }, 1);
      expect(result).toEqual({ error: 'user not found' });
    });

    it('should return an error if the user has overdue books', async () => {
      const mockOverdueBook = {
        _id: '1',
        isbn: '1234567890123',
        dueDate: new Date(Date.now() - 10000),
      };

      BookCheckoutModelMock.populate.mockResolvedValueOnce([mockOverdueBook]);
      const result = await service.checkout({ isbn: '1234567890123' }, 1);
      expect(result).toEqual({ error: 'overdue books' });
    });

    it('should return an error if the user has reached the maximum number of books', async () => {
      process.env.MAX_CHECKOUTS = '1';
      const mockBooks = [
        {
          _id: '1',
          isbn: '1234567890123',
          dueDate: new Date(Date.now() + 10000),
        },
        {
          _id: '1',
          isbn: '1234567890123',
          dueDate: new Date(Date.now() + 10000),
        },
        {
          _id: '1',
          isbn: '1234567890123',
          dueDate: new Date(Date.now() + 10000),
        },
      ];
      BookCheckoutModelMock.populate.mockResolvedValueOnce(mockBooks);
      const result = await service.checkout({ isbn: '1234567890123' }, 1);
      expect(result).toEqual({ error: 'too many checkouts' });
    });

    it('should return an error if the book is not available', async () => {
      const mockCheckouts = [];
      BookCheckoutModelMock.populate.mockResolvedValueOnce(mockCheckouts);
      BookModelMock.findOne.mockResolvedValueOnce(null);
      const result = await service.checkout({ isbn: '1234567890123' }, 1);
      expect(result).toEqual({ error: 'book not found' });
    });

    it('should return unknown error if an error occurs updating the book status', async () => {
      const mockCheckouts = [];
      BookCheckoutModelMock.populate.mockResolvedValueOnce(mockCheckouts);
      BookModelMock.findOne.mockResolvedValueOnce({ _id: '1' });
      BookModelMock.updateOne.mockRejectedValueOnce('error');
      const result = await service.checkout({ isbn: '1234567890123' }, 1);
      expect(result).toEqual({ error: 'unknown error' });
      expect(BookCheckoutModelMock.deleteOne).toHaveBeenCalledTimes(1);
    });

    it('should create a checkout record and update the book status', async () => {
      process.env.CHECKOUT_PERIOD = '14';
      const mockCheckouts = [];
      BookCheckoutModelMock.populate.mockResolvedValueOnce(mockCheckouts);
      BookModelMock.findOne.mockResolvedValueOnce({ _id: '1' });
      BookModelMock.updateOne.mockResolvedValueOnce({ _id: '1' });
      BookCheckoutModelMock.create.mockResolvedValueOnce({ _id: '1' });
      const mockRequest = { isbn: '1234567890123' };
      const result = await service.checkout(mockRequest, 1);
      expect(result).toEqual({ _id: '1' });
      expect(BookCheckoutModelMock.create).toHaveBeenCalledTimes(1);
      expect(BookModelMock.updateOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('returnBook', () => {
    it('should return an error if the checkout does not exist', async () => {
      BookCheckoutModelMock.findOne.mockResolvedValueOnce(null);
      const result = await service.returnBook('65b6ebc7fd5aeaceb7aef2bb', 1);
      expect(result).toEqual({ error: 'no checkout found' });
    });

    it('should return unknown if an error occurs updating the book status and reset checkout status', async () => {
      const mockCheckout = {
        _id: '1',
        status: 'LOANED',
        save: jest.fn().mockReturnThis(),
      };
      BookCheckoutModelMock.findOne.mockResolvedValueOnce(mockCheckout);
      BookModelMock.updateOne.mockRejectedValueOnce('error');
      const result = await service.returnBook('65b6ebc7fd5aeaceb7aef2bb', 1);
      expect(result).toEqual({ error: 'unknown error' });
      expect(mockCheckout.save).toHaveBeenCalledTimes(2);
      expect(mockCheckout.status).toEqual('LOANED');
    });

    it('should return nothing and update the book status', async () => {
      const mockCheckout = {
        _id: '1',
        status: BookCheckoutStatus.LOANED,
        save: jest.fn().mockReturnThis(),
      };
      BookCheckoutModelMock.findOne.mockResolvedValueOnce(mockCheckout);
      await service.returnBook('65b6ebc7fd5aeaceb7aef2bb', 1);
      expect(mockCheckout.save).toHaveBeenCalledTimes(1);
      expect(BookModelMock.updateOne).toHaveBeenCalledTimes(1);
      expect(mockCheckout.status).toEqual(BookCheckoutStatus.RETURNED);
    });
  });

  describe('create', () => {
    it('should call the create method on the model with the proper attributes', async () => {
      const mockRequest = {
        isbn: '1234567890123',
        title: 'title',
        author: 'Robert Jordan',
      };
      await service.create(mockRequest);
      expect(BookModelMock.create).toHaveBeenCalledTimes(1);
      expect(BookModelMock.create).toHaveBeenCalledWith({
        ...mockRequest,
        status: BookStatus.AVAILABLE,
      });
    });
  });

  describe('getOverdueBooks', () => {
    it('should return an empty array if no overdue books are found', async () => {
      BookCheckoutModelMock.populate.mockResolvedValueOnce([]);
      const result = await service.getOverdueBooks();
      expect(result).toEqual([]);
    });

    it('should return an array of overdue books', async () => {
      const mockOverdueBook = {
        _id: '65b6ebc7fd5aeaceb7aef2bb',
        isbn: '1234567890123',
        dueDate: new Date(Date.now() - 10000),
      };
      BookCheckoutModelMock.populate.mockResolvedValueOnce([mockOverdueBook]);
      const result = await service.getOverdueBooks();
      expect(result).toEqual([mockOverdueBook]);
    });
  });

  describe('getActiveCheckouts', () => {
    it('should return an empty array if no active checkouts are found', async () => {
      BookCheckoutModelMock.populate.mockResolvedValueOnce([]);
      const result = await service.getActiveCheckouts(1);
      expect(result).toEqual([]);
    });

    it('should return an array of active checkouts', async () => {
      const mockOverdueBook = {
        _id: '65b6ebc7fd5aeaceb7aef2bb',
        isbn: '1234567890123',
        dueDate: new Date(Date.now() + 10000),
      };
      BookCheckoutModelMock.populate.mockResolvedValueOnce([mockOverdueBook]);
      const result = await service.getActiveCheckouts(1);
      expect(result).toEqual([mockOverdueBook]);
    });
  });

  describe('findAll', () => {
    it('should return an empty array if no books are found', async () => {
      BookModelMock.find.mockResolvedValueOnce([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
    it('should return an array of books', async () => {
      const mockBooks = [
        {
          _id: '65b6ebc7fd5aeaceb7aef2bb',
          isbn: '1234567890123',
          title: 'book',
          author: 'you-know-who',
        },
      ];
      BookModelMock.find.mockResolvedValueOnce(mockBooks);
      const result = await service.findAll();
      expect(result).toEqual(mockBooks);
      expect(BookModelMock.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return null if no book is found', async () => {
      BookModelMock.findOne.mockResolvedValueOnce(null);
      const result = await service.findOne('65b6ebc7fd5aeaceb7aef2bb');
      expect(result).toEqual(null);
    });

    it('should return a book', async () => {
      const mockBook = {
        _id: '65b6ebc7fd5aeaceb7aef2bb',
        isbn: '1234567890123',
        title: 'book',
        author: 'you-know-who',
      };
      BookModelMock.findOne.mockResolvedValueOnce(mockBook);
      const result = await service.findOne('65b6ebc7fd5aeaceb7aef2bb');
      expect(result).toEqual(mockBook);
    });
  });

  describe('remove', () => {
    it('should return an error if the book is checked out', async () => {
      const mockBook = {
        _id: '65b6ebc7fd5aeaceb7aef2bb',
        isbn: '1234567890123',
        title: 'book',
        status: BookStatus.LOANED,
      };
      BookModelMock.findOne.mockResolvedValueOnce(mockBook);
      const result = await service.remove('65b6ebc7fd5aeaceb7aef2bb');
      expect(result).toEqual({ error: 'book checked out' });
    });

    it('should return an error if the book is not found', async () => {
      BookModelMock.findOne.mockResolvedValueOnce(null);
      const result = await service.remove('65b6ebc7fd5aeaceb7aef2bb');
      expect(result).toEqual({ error: 'book not found' });
    });

    it('should return an error if an error occurs deleting the book', async () => {
      const mockBook = {
        _id: '1',
        isbn: '1234567890123',
        title: 'book',
        status: BookStatus.AVAILABLE,
      };
      BookModelMock.findOne.mockResolvedValueOnce(mockBook);
      BookModelMock.deleteOne.mockRejectedValueOnce('error');
      const result = await service.remove('id');
      expect(result).toEqual({ error: 'unknown error' });
    });

    it('should call delete if the book is eligible for deletion', async () => {
      const mockBook = {
        _id: '1',
        isbn: '1234567890123',
        title: 'book',
        status: BookStatus.AVAILABLE,
      };
      BookModelMock.findOne.mockResolvedValueOnce(mockBook);
      await service.remove('id');
      expect(BookModelMock.deleteOne).toHaveBeenCalledTimes(1);
    });
  });
});
