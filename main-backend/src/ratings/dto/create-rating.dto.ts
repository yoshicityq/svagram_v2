import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateRatingDto {
  @Transform(({ value }) => {
    return Number(JSON.parse(value));
  })
  @IsNumber()
  rating!: number;
}
