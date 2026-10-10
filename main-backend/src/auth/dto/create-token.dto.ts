import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTokenDto {
  @IsNotEmpty()
  @IsString()
  jti!: string;

  @IsNotEmpty()
  @IsNumber()
  userId!: number;

  @IsNotEmpty()
  @IsBoolean()
  revoked!: boolean;

  @IsNotEmpty()
  @IsString()
  createdAt!: string;

  @IsNotEmpty()
  @IsString()
  expiresAt!: string;
}
