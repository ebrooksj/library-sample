import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import {
  BookCheckout,
  BookCheckoutSchema,
} from './entities/book-checkout.entity';
import { Book, BookSchema } from './entities/book.entity';

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
