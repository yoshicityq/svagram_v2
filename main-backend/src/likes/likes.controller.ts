import { Controller, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { LikesService } from './likes.service';

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('/posts/:id/like')
  async toggleLike(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req: Request,
  ) {
    const now = String(Date.now());

    return this.likesService.toggleLike(postId, Number(req['user'].sub), now);
  }
}
