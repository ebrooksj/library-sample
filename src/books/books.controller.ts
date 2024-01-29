import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { HasRole } from '../authorization/decorators/roles/role.decorator';
import { Role } from '../authorization/decorators/roles/role.enum';
import { HasRoleGuard } from '../authorization/guards/has-role/has-role.guard';
import { APP_CONSTANTS } from '../config';
import { BooksService } from './books.service';
import { CreateBookCheckoutDto } from './dto/create-book-checkout.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UserAPIToken } from '../authorization/decorators/user-api-token/user-api-token.decorator';

@UseGuards(HasRoleGuard)
@Controller('books')
@ApiBearerAuth(APP_CONSTANTS.AUTH_HEADER)
@ApiTags('books')
export class BooksController {
  private readonly logger: Logger = new Logger(BooksController.name);
  constructor(private readonly booksService: BooksService) {}

  /**
   * Validates the book id is the proper format.
   * This could be done with a custom validator. Doing it the simple way in the interest of time.
   * @param id
   */
  private validateBookId(id) {
    if (!mongoose.isValidObjectId(id)) {
      this.logger.warn(`Invalid book id ${id}`);
      throw new UnprocessableEntityException(['book id is not valid']);
    }
  }

  @Get()
  @HasRole(Role.LIBRARIAN, Role.USER)
  async findAll() {
    return this.booksService.findAll();
  }
  @Post()
  @HasRole(Role.LIBRARIAN)
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Post('checkout')
  @HasRole(Role.USER)
  async checkout(
    // This could be a path param, but keeping in the body does allow for extensibility later
    @Body() checkoutBookDto: CreateBookCheckoutDto,
    @UserAPIToken() userId: string,
  ) {
    const checkoutResult = await this.booksService.checkout(
      checkoutBookDto,
      +userId,
    );
    if ('error' in checkoutResult) {
      const { error } = checkoutResult;
      const notFound = error === 'user not found' || error === 'book not found';
      const serverError = error === 'unknown error';
      if (notFound) {
        throw new NotFoundException(error.toString());
      }
      if (serverError) {
        // Error will be handled by the global exception handler
        throw new Error(
          'An unexpected error has occurred. Please try again later.',
        );
      }
      throw new ConflictException(error.toString());
    }
    return checkoutResult;
  }

  @Delete('checkout/:id')
  @HasRole(Role.USER)
  @HttpCode(204)
  async returnBook(
    @Param('id') bookId: string,
    @UserAPIToken() userId: string,
  ) {
    this.logger.debug(`Returning book with id ${bookId}`);
    this.validateBookId(bookId);
    const returnResult = await this.booksService.returnBook(bookId, +userId);
    if ('error' in returnResult) {
      const { error } = returnResult;
      this.logger.warn(`Error returning book: ${error}`);
      if (error == 'no checkout found') {
        throw new NotFoundException(error.toString());
      }
      if (error == 'unknown error') {
        throw new InternalServerErrorException(
          'An unexpected error has occurred. Please try again later.',
        );
      }
    }
    return;
  }

  @Get('checkout/overdue')
  @HasRole(Role.LIBRARIAN)
  findOverdue(@Query() { user }: UserIdParamDto) {
    return this.booksService.getOverdueBooks(user);
  }

  @Get('checkout/active')
  @HasRole(Role.USER)
  findLoanedToUser(@UserAPIToken() userId: string) {
    return this.booksService.getActiveCheckouts(+userId);
  }

  @Get(':id')
  @HasRole(Role.LIBRARIAN, Role.USER)
  async findOne(@Param('id') bookId: string) {
    this.validateBookId(bookId);
    const book = await this.booksService.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }
    return book;
  }

  @Delete(':id')
  @HttpCode(204)
  @HasRole(Role.LIBRARIAN)
  async remove(@Param('id') bookId: string) {
    this.validateBookId(bookId);
    const removeResult = await this.booksService.remove(bookId);
    if ('error' in removeResult) {
      const { error } = removeResult;
      this.logger.warn(`Error removing book: ${error}`);
      if (error == 'book not found') {
        throw new NotFoundException(error.toString());
      }
      if (error == 'book checked out') {
        throw new ConflictException(error.toString());
      }
      if (error == 'unknown error') {
        throw new InternalServerErrorException(
          'An unexpected error has occurred. Please try again later.',
        );
      }
    }
    this.logger.debug(
      `Successfully removed book with id ${bookId}`,
      removeResult,
    );
    return;
  }
}
