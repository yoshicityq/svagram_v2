import { IsString } from 'class-validator';

export class NewEmailDto {
  @IsString()
  newEmail!: string;
}
