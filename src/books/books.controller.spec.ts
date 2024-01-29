import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

jest.mock('./books.service');

describe('BooksController', () => {
  let controller: BooksController;
  let BooksServiceMock: jest.Mocked<BooksService>;

  beforeEach(async () => {
    BooksServiceMock = jest.mocked(BooksService.prototype);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: BooksServiceMock }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return the created book', async () => {
      const mockResult = { _id: '1' };
      BooksServiceMock.create.mockResolvedValueOnce(mockResult as any);
      const result = await controller.create({
        isbn: '123',
        title: 'title',
        author: 'author',
      });
      expect(result).toEqual(mockResult);
    });
  });
  describe('checkout', () => {
    it(`should throw 404 if book doesn't exist`, async () => {
      BooksServiceMock.checkout.mockResolvedValueOnce({
        error: 'book not found',
      });

      expect(controller.checkout({ isbn: '123' }, '1')).rejects.toThrow(
        'book not found',
      );
    });

    it(`should throw 404 if user doesn't exist`, async () => {
      BooksServiceMock.checkout.mockResolvedValueOnce({
        error: 'user not found',
      });

      expect(controller.checkout({ isbn: '123' }, '1')).rejects.toThrow(
        'user not found',
      );
    });

    it(`should throw 409 if book is already checked out`, async () => {
      BooksServiceMock.checkout.mockResolvedValueOnce({
        error: 'checked out',
      });

      expect(controller.checkout({ isbn: '123' }, '1')).rejects.toThrow(
        'checked out',
      );
    });

    it(`should throw 409 if user has too many checkouts`, async () => {
      BooksServiceMock.checkout.mockResolvedValueOnce({
        error: 'too many checkouts',
      });

      expect(controller.checkout({ isbn: '123' }, '1')).rejects.toThrow(
        'too many checkouts',
      );
    });

    it(`should throw 409 if user has overdue books`, async () => {
      BooksServiceMock.checkout.mockResolvedValueOnce({
        error: 'overdue books',
      });

      expect(controller.checkout({ isbn: '123' }, '1')).rejects.toThrow(
        'overdue books',
      );
    });

    it(`should throw 500 if an unknown error occurs`, async () => {
      BooksServiceMock.checkout.mockResolvedValueOnce({
        error: 'unknown error',
      });

      expect(controller.checkout({ isbn: '123' }, '1')).rejects.toThrow(
        'An unexpected error has occurred. Please try again later.',
      );
    });

    it(`should return the due date if successful`, async () => {
      const isbn = '123';
      const due = new Date();
      const mockResult = { due, isbn };
      BooksServiceMock.checkout.mockResolvedValueOnce(mockResult as any);
      expect(controller.checkout({ isbn }, '1')).resolves.toEqual(mockResult);
    });
  });

  describe('returnBook', () => {
    it('should throw 404 if there is no checkout for the book', () => {
      BooksServiceMock.returnBook.mockResolvedValueOnce({
        error: 'no checkout found',
      });

      expect(
        controller.returnBook('65b6ebc7fd5aeaceb7aef2bb', '1'),
      ).rejects.toThrow('no checkout found');
    });

    it('should throw 422 if the book id is invalid', () => {
      expect(controller.returnBook('a', '1')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw 500 if an unknown error occurs', () => {
      BooksServiceMock.returnBook.mockResolvedValueOnce({
        error: 'unknown error',
      });

      expect(
        controller.returnBook('65b6ebc7fd5aeaceb7aef2bb', '1'),
      ).rejects.toThrow(
        'An unexpected error has occurred. Please try again later.',
      );
    });

    it('should return nothing if successful', async () => {
      BooksServiceMock.returnBook.mockResolvedValueOnce({} as any);
      const result = await controller.returnBook(
        '65b6ebc7fd5aeaceb7aef2bb',
        '1',
      );
      expect(result).toEqual(undefined);
    });
  });

  describe('findOverdue', () => {
    it('should return the overdue books', async () => {
      const mockResult = [{ _id: '1' }];
      BooksServiceMock.getOverdueBooks.mockResolvedValueOnce(mockResult as any);
      const result = await controller.findOverdue({ user: 1 });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findLoanedToUser', () => {
    it('should return the books checked out to the user', async () => {
      const mockResult = [{ _id: '1' }];
      BooksServiceMock.getActiveCheckouts.mockResolvedValueOnce(
        mockResult as any,
      );
      const result = await controller.findLoanedToUser('1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should throw 422 if the book id is invalid', async () => {
      expect(controller.findOne('1')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw 404 if the book is not found', async () => {
      BooksServiceMock.findOne.mockResolvedValueOnce(null);
      expect(controller.findOne('65b6ebc7fd5aeaceb7aef2bb')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the book', async () => {
      const mockResult = { _id: '1' };
      BooksServiceMock.findOne.mockResolvedValueOnce(mockResult as any);
      const result = await controller.findOne('65b6ebc7fd5aeaceb7aef2bb');
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should throw 422 if the book id is invalid', async () => {
      expect(controller.findOne('1')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw 404 if the book is not found', async () => {
      BooksServiceMock.remove.mockResolvedValueOnce({
        error: 'book not found',
      } as any);
      expect(controller.remove('65b6ebc7fd5aeaceb7aef2bb')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw 409 if the book is not available', async () => {
      BooksServiceMock.remove.mockResolvedValueOnce({
        error: 'book checked out',
      } as any);

      expect(controller.remove('65b6ebc7fd5aeaceb7aef2bb')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw 500 if an unknown error occurs', async () => {
      BooksServiceMock.remove.mockResolvedValueOnce({ error: 'unknown error' });
      expect(controller.remove('65b6ebc7fd5aeaceb7aef2bb')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should return nothing on success', async () => {
      const mockResult = { _id: '1' };
      BooksServiceMock.findOne.mockResolvedValueOnce({ _id: '1' } as any);
      BooksServiceMock.remove.mockResolvedValueOnce(mockResult as any);
      const result = await controller.remove('65b6ebc7fd5aeaceb7aef2bb');
      expect(result).toEqual(undefined);
    });
  });
});
