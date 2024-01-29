import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UserIdParamDto {
  @Type(() => Number)
  @IsInt()
  user: number;
}
