import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { TitlesController } from './titles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Title } from './title.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Title])],
  providers: [TitlesService],
  controllers: [TitlesController],
})
export class TitlesModule {}
