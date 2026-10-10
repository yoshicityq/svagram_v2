import { Module } from '@nestjs/common';
import { VerificationCodesService } from './verification_codes.service';
import { VerificationCodesController } from './verification_codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './verification_codes.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode]), UsersModule],
  providers: [VerificationCodesService],
  controllers: [VerificationCodesController],
})
export class VerificationCodesModule {}
