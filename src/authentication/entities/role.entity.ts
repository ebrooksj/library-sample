import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../decorators/roles/role.enum';

export type RoleDocument = HydratedDocument<UserRole>;

@Schema({ autoIndex: true, timestamps: true })
export class UserRole {
  @Prop({ type: Number, required: true, unique: true })
  userId: number;
  @Prop({ type: String, enum: Role, required: true })
  role: Role;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
