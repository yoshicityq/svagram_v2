import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Headers,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import type { Request, Response } from 'express';
import { PostsService } from 'src/posts/posts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckPassDto } from './dto/check-password.dto';
import { User } from './user.entity';
import { UserTitlesService } from 'src/user_titles/user_titles.service';
@Controller(`users`)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTitlesService: UserTitlesService,
  ) {}

  // Регистрация пользователя
  @Public()
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Проверка имени при регистрации
  @Public()
  @Get('check-username/:username')
  async checkExistingUsername(
    @Param('username') username: string,
  ): Promise<{ isAvailable: boolean }> {
    const exists = await this.usersService.isUserExists('username', username);
    return { isAvailable: !exists };
  }

  // Проверка почты при регистрации
  @Public()
  @Get('check-email/:email')
  async checkEmail(
    @Param('email') email: string,
  ): Promise<{ isAvailable: boolean }> {
    const exists = await this.usersService.isUserExists('email', email);
    return { isAvailable: !exists };
  }

  // Проверка пароля
  @Post('check-password')
  async checkPassword(@Req() req: Request, @Body() checkPassDto: CheckPassDto) {
    return this.usersService.checkPassword(
      Number(req['user'].sub),
      checkPassDto.currentPassword,
    );
  }

  // Получение страницы пользователя
  @Get('/:username')
  async getProfile(@Req() req: Request, @Param('username') username: string) {
    const viewerId = Number(req['user'].sub);

    const user = await this.usersService.getProfile(username, viewerId);
    return user;
  }

  // Получение аватара пользователя
  @Get('/:username/avatar')
  async getAvatar(@Param('username') username: string, @Res() res: Response) {
    const { avatar, avatarMimeType } =
      await this.usersService.findAvatar(username);

    res.setHeader('Content-Type', avatarMimeType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=3600');

    return res.send(avatar);
  }

  // Редактирование профиля
  @Patch('/me')
  @UseInterceptors(FileInterceptor('profile_img'))
  async editProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    avatar?: Express.Multer.File,
  ) {
    const user = await this.usersService.editProfile(
      Number(req['user'].sub),
      avatar,
      updateUserDto,
    );
    console.log(updateUserDto);
    if (!user) {
      return {
        ok: false,
        updated: false,
      };
    }

    return {
      ok: true,
      updated: true,
      user: {
        id: user.id,
        username: user.username,
        city: user.username,
        description: user.description,
        favorite_brands: user.favoriteBrands,
        hasAvatar: !!user.avatar,
        avatar: user.avatar ? `/users/${user.username}/avatar` : null,
      },
    };
  }

  // Удаление профиля
  @Delete('/me/delete')
  async deleteUser(@Req() req: Request) {
    const userId = Number(req['user'].sub);
    const result = await this.usersService.removeUser(userId);
    return result;
  }

  @Get('/me/privacy')
  async getPrivacy(@Req() req: Request) {
    const user = await this.usersService.findById(Number(req['user'].sub));
    return {
      privacy: {
        isPrivate: user.isPrivate,
        likedPostsVisibility: user.likedPostsVisibility,
        ratedPostsVisibility: user.ratedPostsVisibility,
      },
    };
  }

  @Patch('/me/privacy')
  async updatePrivacy(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;

    const user = await this.usersService.update(userId, updateUserDto);
    return {
      updated: true,
      privacy: {
        isPrivate: user.isPrivate,
        likedPostsVisibility: user.likedPostsVisibility,
        ratedPostsVisibility: user.ratedPostsVisibility,
      },
    };
  }

  @Get('/me/titles')
  async getUserTitlesList(@Req() req: Request) {
    const userId = Number(req['user'].sub);
    const titles = await this.userTitlesService.getUserTitlesList(userId);
    return titles;
  }

  @Patch('/me/titles')
  async setActiveTitle(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = Number(req['user'].sub);
    const updatedUser = await this.usersService.update(userId, updateUserDto);
    return {
      ok: true,
      titleId: updatedUser.title ? updatedUser.title.id : null,
    };
  }
  @Get('search/:prefix')
  async searchUsers(@Param('prefix') prefix: string) {
    if (!prefix) return { usernames: [] };
    const usernames = await this.usersService.searchUsernames(prefix);
    return { usernames };
  }
}
