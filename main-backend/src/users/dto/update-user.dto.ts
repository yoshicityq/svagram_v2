import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostsVisibility } from '../enums/privacy';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }

    return value;
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteBrands?: string[];

  @IsOptional()
  @IsInt()
  titleId?: number | null;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsEnum(PostsVisibility)
  likedPostsVisibility?: PostsVisibility;

  @IsOptional()
  @IsEnum(PostsVisibility)
  ratedPostsVisibility?: PostsVisibility;
}
