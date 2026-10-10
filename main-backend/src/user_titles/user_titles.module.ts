import { Module } from '@nestjs/common';
import { UserTitlesService } from './user_titles.service';
import { UserTitlesController } from './user_titles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTitle } from './user_title.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTitle])],
  providers: [UserTitlesService],
  controllers: [UserTitlesController],
  exports: [UserTitlesService],
})
export class UserTitlesModule {}
