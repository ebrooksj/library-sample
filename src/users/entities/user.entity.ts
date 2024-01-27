import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

class UserName {
  @Prop({ required: true })
  first: string;

  @Prop({ required: true })
  last: string;
}

@Schema({ autoIndex: true, timestamps: true })
export class User {
  // Custom user id to be compliant with requirements
  @Prop({ required: true, unique: true })
  userId: number;

  @Prop({ required: true })
  name: UserName;

  @Prop({ required: true, unique: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
