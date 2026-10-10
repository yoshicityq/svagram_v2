import {
  Body,
  Controller,
  Req,
  UploadedFile,
  UseInterceptors,
  Post,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Param,
  StreamableFile,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { PostData, PostResponseDto } from './dto/post-response.dto';
import { UsersService } from 'src/users/users.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/posts/create')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Req() req: Request,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ): Promise<PostResponseDto> {
    const userId = Number(req['user'].sub);
    const newPost = await this.postsService.create(
      createPostDto,
      userId,
      image,
    );
    return newPost;
  }

  // Получение постов пользователя
  @Get('/users/:username/posts')
  async getProfilePosts(
    @Param('username') username: string,
    @Req() req: Request,
  ): Promise<PostResponseDto[]> {
    const user = await this.usersService.findByUsername(username);
    const userId = Number(user.id);
    return this.postsService.getUserPosts(userId, Number(req['user'].sub));
  }

  //Получение лайкнутых постов пользователя
  @Get('/users/:username/liked-posts')
  async getProfileLikedPosts(
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const user = await this.usersService.findByUsername(username);
    const userId = Number(user.id);
    const currentUserId = Number(req['user'].sub);
    const likedPosts = await this.postsService.getUserLikedPosts(
      userId,
      currentUserId,
    );
    return likedPosts;
  }

  //Получение оцененных постов пользователя
  @Get('/users/:username/rated-posts')
  async getProfileRatedPosts(
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const user = await this.usersService.findByUsername(username);
    const userId = Number(user.id);
    const currentUserId = Number(req['user'].sub);
    return this.postsService.getUserRatedPosts(userId, currentUserId);
  }

  //   Получение изображения поста
  @Public()
  @Get('/posts/:id/image')
  async getPostImage(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const { image, imgMimeType } = await this.postsService.getPostImage(id);
    return new StreamableFile(image, {
      type: imgMimeType ?? 'application/octet-stream',
    });
  }

  //   Получение поста по id
  @Get('/posts/:id')
  async getPostById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.findById(id, req['user'].sub);
  }

  @Get('/feed')
  async getFeedPosts(@Req() req: Request) {
    return this.postsService.getFeedPosts(req['user'].sub);
  }
}
