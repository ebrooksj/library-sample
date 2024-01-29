import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBookCheckoutDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 13, { message: 'ISBN must be 10 or 13 characters long' })
  @ApiProperty()
  isbn: string;
}
