import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Realistically, we may have other states such as damanged, lost, etc, but that is outside of the scope of the assignment.
export enum BookStatus {
  'AVAILABLE' = 'AVAILABLE',
  'LOANED' = 'LOANED',
}

export type BookDocument = HydratedDocument<Book>;
@Schema({ autoIndex: true, timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, unique: true })
  isbn: string;

  @Prop()
  genre?: string;

  @Prop()
  publishDate?: Date;

  @Prop({
    type: String,
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
    required: true,
  })
  status: BookStatus;
}

export const BookSchema = SchemaFactory.createForClass(Book);
