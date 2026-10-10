import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CheckPassDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return String(value);
  })
  @IsString()
  currentPassword!: string;
}
