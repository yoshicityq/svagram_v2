import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import type { Request } from 'express';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('/posts/:id/rating')
  async ratePost(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const actorUserId = req['user'].sub;
    const now = String(Date.now());
    return this.ratingsService.ratePost(
      id,
      actorUserId,
      createRatingDto.rating,
      now,
    );
  }
}
