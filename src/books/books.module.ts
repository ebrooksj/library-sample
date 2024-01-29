import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './entities/book.entity';
import {
  BookCheckout,
  BookCheckoutSchema,
} from './entities/book-checkout.entity';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookCheckout.name, schema: BookCheckoutSchema },
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
