import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  author: string;

  @IsString()
  @Length(10, 13, { message: 'ISBN must be 10 or 13 numbers long' }) // Technically 10 OR 13, but that would require a custom validator
  @ApiProperty()
  isbn: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  genre?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  publishDate?: Date;
}
