import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Category } from 'src/interfaces/category';

export class CreatePostDto {
  @IsNumberString()
  date!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @IsLatitude()
  latitude?: string | null;

  @IsOptional()
  @IsString()
  @IsLongitude()
  longitude?: string | null;

  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @IsOptional()
  @IsArray()
  categoryList?: Category[] | null;
}
