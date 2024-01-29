import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import { Book } from './book.entity';

export enum BookCheckoutStatus {
  'LOANED' = 'LOANED',
  'RETURNED' = 'RETURNED',
}

export type BookCheckoutDocument = HydratedDocument<BookCheckout>;
@Schema({ autoIndex: true, timestamps: true })
export class BookCheckout {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'Book' })
  book: Book;

  @Prop()
  dueDate?: Date;

  @Prop({
    type: String,
    enum: BookCheckoutStatus,
    default: BookCheckoutStatus.LOANED,
    required: true,
  })
  status: BookCheckoutStatus;
}

export const BookCheckoutSchema = SchemaFactory.createForClass(BookCheckout);
