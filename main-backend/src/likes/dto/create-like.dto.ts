import { IsNumber, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsNumber()
  postId!: number;

  @IsNumber()
  userId!: number;

  @IsString()
  createdAt!: string;
}
