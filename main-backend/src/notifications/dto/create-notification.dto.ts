import {
  IsBoolean,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  recipientUserId!: number;

  @IsNumber()
  actorUserId!: number | null;

  @IsString()
  type!: string;

  @IsString()
  sourceType!: string;

  @IsOptional()
  @IsString()
  entityType?: string | null;

  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @IsString()
  title!: string;

  @IsString()
  text!: string;

  @IsString()
  createdAt!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsJSON()
  metadata!: string | null;
}
