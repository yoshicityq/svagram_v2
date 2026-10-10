import { IsOptional, IsString } from 'class-validator';

export class CreateTitleDto {
  @IsString()
  titleName!: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}
