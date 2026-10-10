import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comm.dto';
import type { Request } from 'express';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('/posts/:id/comments')
  async publishComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const now = String(Date.now());
    const newComment = await this.commentsService.publishComment(
      id,
      Number(req['user'].sub),
      now,
      createCommentDto,
    );

    return newComment;
  }

  @Get('/posts/:id/comments')
  async getPostComments(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.commentsService.getPostComments(id, Number(req['user'].sub));
  }
}
