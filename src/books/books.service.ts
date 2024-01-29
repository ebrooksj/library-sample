import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ENV_KEYS } from '../config/env.constants';
import { addDays } from '../lib/util/add-days';
import { UsersService } from '../users/users.service';
import { CreateBookCheckoutDto } from './dto/create-book-checkout.dto';
import { CreateBookDto } from './dto/create-book.dto';
import {
  BookCheckout,
  BookCheckoutStatus,
} from './entities/book-checkout.entity';
import { Book, BookStatus } from './entities/book.entity';
@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    @InjectModel(Book.name) private readonly BookModel: Model<Book>,
    @InjectModel(BookCheckout.name)
    private readonly BookCheckoutModel: Model<BookCheckout>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    this.logger.debug(`Creating book with isbn ${createBookDto.isbn}`);
    return this.BookModel.create({
      ...createBookDto,
      status: BookStatus.AVAILABLE,
    });
  }

  findAll() {
    return this.BookModel.find();
  }

  findOne(id: string) {
    return this.BookModel.findOne({ _id: id });
  }

  /**
   * Remove a book. Will return an error if the book is not available.
   * @param id
   * @returns
   */
  async remove(id: string) {
    this.logger.debug(`Deleting book with id ${id}`);
    const book = await this.findOne(id);
    if (!book) {
      return { error: 'book not found' };
    }
    if (book.status !== BookStatus.AVAILABLE) {
      return { error: 'book checked out' };
    }
    try {
      return await this.BookModel.deleteOne({ _id: id });
    } catch (error) {
      this.logger.error(`Error deleting book ${id}: ${error}`);
      return { error: 'unknown error' };
    }
  }

  private findAvailableByIsbn(isbn: String) {
    this.logger.debug(`Finding first available book with isbn ${isbn}`);
    return this.BookModel.findOne({
      isbn,
      status: BookStatus.AVAILABLE.toString(),
    });
  }

  async getActiveCheckouts(userId: number) {
    return this.BookCheckoutModel.find({
      userId,
      status: BookCheckoutStatus.LOANED.toString(),
    }).populate('book');
  }

  async getOverdueBooks(userId: number) {
    return this.BookCheckoutModel.find({
      userId,
      status: BookCheckoutStatus.LOANED.toString(),
      dueDate: { $lt: new Date() },
    }).populate('book');
  }

  private filterOverdueBooks(checkouts: BookCheckout[]) {
    const now = new Date();
    return checkouts.filter((checkout) => checkout.dueDate < now);
  }

  private calculateDueDate() {
    const { CHECKOUT_PERIOD } = ENV_KEYS;
    const checkoutDays = this.configService.get<number>(CHECKOUT_PERIOD);
    const result = addDays(new Date(), checkoutDays);
    return result;
  }

  private updateBookStatus(
    bookId: string | mongoose.Types.ObjectId,
    status: BookStatus,
  ) {
    return this.BookModel.updateOne({ _id: bookId }, { status });
  }

  /**
   * Checkout a book for a user. Finds a book with the given isbn, and creates a checkout record. Then marks that book status as checked out.
   * Returns the due date for the book, or an error if the book or user is not found, or if the book is already checked out, or the user has too many concurrent checkouts.
   * @param checkoutDto
   * @param userId
   * @returns
   */
  async checkout({ isbn }: CreateBookCheckoutDto, userId: number) {
    const { MAX_CHECKOUTS } = ENV_KEYS;
    const maxCheckouts = this.configService.get<number>(MAX_CHECKOUTS);
    const user = await this.userService.findOne(userId);
    if (!user) {
      this.logger.debug(`User ${userId} not found`);
      return { error: 'user not found' };
    }
    const checkouts = await this.getActiveCheckouts(userId);
    const overdue = this.filterOverdueBooks(checkouts);
    if (overdue.length > 0) {
      this.logger.debug(`User ${userId} has overdue books`);
      return { error: 'overdue books' };
    }

    if (checkouts.length >= maxCheckouts) {
      this.logger.debug(`User ${userId} has too many checkouts`);
      return { error: 'too many checkouts' };
    }

    const book = await this.findAvailableByIsbn(isbn);
    if (!book) {
      this.logger.debug(`Book ${isbn} not available`);
      return { error: 'book not found' };
    }

    const due = this.calculateDueDate();
    const checkout = await this.BookCheckoutModel.create({
      userId,
      book: book._id,
      dueDate: due,
      status: BookCheckoutStatus.LOANED,
    });

    try {
      // We could use a session for this, but then you need a mongo instance running with a replica set
      const updateResult = await this.updateBookStatus(
        book._id,
        BookStatus.LOANED,
      );
      this.logger.verbose(
        `Successfully checked out book ${book._id} to user ${userId}`,
      );
    } catch (error) {
      this.logger.error(`Error updating book status: ${error}`);
      await this.BookCheckoutModel.deleteOne({ _id: checkout._id });
      return { error: 'unknown error' };
    }
    return checkout;
  }

  /**
   * Return a book. Markes the loan entity as returned, and updates the book status to available.
   * @param bookId
   * @param userId
   * @returns
   */
  async returnBook(bookId: string, userId: number) {
    const checkout = await this.BookCheckoutModel.findOne({
      userId,
      book: new mongoose.Types.ObjectId(bookId),
      status: BookCheckoutStatus.LOANED,
    });
    if (!checkout) {
      this.logger.debug(
        `No checkout found for book ${bookId} and user ${userId}`,
      );
      return { error: 'no checkout found' };
    }

    checkout.status = BookCheckoutStatus.RETURNED;
    checkout.save();
    this.logger.verbose(`Checkout ${checkout.id} updated to returned status`);
    try {
      await this.updateBookStatus(bookId, BookStatus.AVAILABLE);
      this.logger.verbose(
        `Successfully returned book ${bookId} from user ${userId}`,
      );
      return checkout;
    } catch (error) {
      checkout.status = BookCheckoutStatus.LOANED;
      checkout.save();
      this.logger.error(`Error returning book: ${error}`);
      return { error: 'unknown error' };
    }
  }
}
