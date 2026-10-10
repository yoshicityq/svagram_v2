import { IsString } from 'class-validator';

export class NewPassDto {
  @IsString()
  newPassword!: string;
}
