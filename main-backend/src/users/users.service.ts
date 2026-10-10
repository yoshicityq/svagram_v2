import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import {
  SearchOptions,
  UserSearchOptions,
} from 'src/interfaces/search_options';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import {
  UserInfo,
  UserPermissions,
  UserPrivacy,
} from 'src/interfaces/user_info';
import { UserTitlesService } from 'src/user_titles/user_titles.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly usersTitlesService: UserTitlesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Создание пользователя
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email, city } = createUserDto;
    const existingUser = await this.isUserExists('username', username);

    if (existingUser) {
      throw new ConflictException(
        `User with username ${username} already exists`,
      ); // 409 Conflict
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      username: username,
      password: passwordHash,
      email: email,
      city: city,
    });

    const result = await this.usersRepository.save(newUser);
    const now = String(Date.now());
    if (result) {
      await this.usersTitlesService.grantTitle(result.id, 2, now);
      await this.notificationsService.create(
        {
          recipientUserId: result.id,
          actorUserId: null, // Система или администратор
          type: 'title',
          sourceType: 'system',
          entityType: 'user',
          entityId: result.id,
          title: 'notification.congratulations_title',
          text: `notification.achievement_text`,
          content: `notification.achievement_reg_content`,
          createdAt: now,
          isRead: false,
          metadata: JSON.stringify({
            titleId: 2,
            titleName: 'Zvezdochka',
          }),
        },
        { title: '', text: '', type: '' },
      );
    }
    return result;
  }

  // Все пользователи
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  //   Поиск по юзернейму
  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: { title: true },
      relations: { title: true },
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }
  // Проверка существования пользователя
  async isUserExists(
    param: 'username' | 'email',
    value: string,
  ): Promise<boolean> {
    return this.usersRepository.existsBy(
      param === 'username' ? { username: value } : { email: value },
    );
  }
  //   Поиск по ID
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: { title: true },
      relations: { title: true },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${id} not found`);
    }
    return user;
  }

  //   Поиск по почте
  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User with username ${email} not found`);
    }
    return user;
  }

  //   Получение аватара профиля
  async findAvatar(
    username: string,
  ): Promise<{ avatar: Buffer | null; avatarMimeType: string | null }> {
    const user = await this.usersRepository.findOne({
      where: { username: username },
      select: {
        avatar: true,
        avatarMimeType: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    if (!user.avatar) {
      throw new NotFoundException(`User ${username} has no avatar`);
    }

    return {
      avatar: user.avatar ?? null,
      avatarMimeType: user.avatarMimeType ?? null,
    };
  }

  //   Получение настроек приватности пользователя
  async findUserPrivacySettings(id: number): Promise<{
    isPrivate: boolean;
    likedPostsVisibility: string;
    ratedPostsVisibility: string;
  }> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        isPrivate: true,
        likedPostsVisibility: true,
        ratedPostsVisibility: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      isPrivate: user.isPrivate,
      likedPostsVisibility: user.likedPostsVisibility,
      ratedPostsVisibility: user.ratedPostsVisibility,
    };
  }

  //   Обновление данных пользователя
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  //   Удаление пользователя
  async removeUser(id: number) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { success: true };
  }

  // Обновление/Удаление аватара пользователя
  async updateAvatar(
    id: number,
    avatar: Buffer | null,
    avatarMimeType: string | null,
  ): Promise<User> {
    const result = await this.usersRepository.update(id, {
      avatar: avatar,
      avatarMimeType: avatarMimeType,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.findById(id);
  }

  //   Поиск пользователей при вводе в поиске
  async searchUsernames(prefix: string, { limit = 10 }: SearchOptions = {}) {
    const users = await this.usersRepository.find({
      select: { id: true, username: true, avatarMimeType: true },
      where: { username: Like(`%${prefix}%`) },
      order: { username: 'ASC' },
      take: limit,
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarMimeType ? `/users/${user.username}/avatar` : null,
    }));
  }

  async getProfile(
    profileUsername: string,
    viewerId: number,
  ): Promise<{
    user: UserInfo;
    permissions: UserPermissions;
    privacy: UserPrivacy | null;
  }> {
    const user = await this.findByUsername(profileUsername);
    const isOwner = viewerId === user.id;
    const canViewPosts = isOwner || !user.isPrivate;
    const canViewLikedPosts = isOwner || user.likedPostsVisibility === 'public';
    const canViewRatedPosts = isOwner || user.ratedPostsVisibility === 'public';

    return {
      user: {
        id: user.id,
        username: user.username,
        city: user.city,
        description: user.description,
        favorite_brands: user.favoriteBrands,
        avatarUrl: user.avatar ? `/users/${user.id}/avatar` : null,
        title: user.title
          ? {
              id: user.title?.id,
              titleName: user.title?.titleName,
            }
          : null,

        role: user.role,
      },
      permissions: {
        isOwner,
        canViewPosts,
        canViewLikedPosts,
        canViewRatedPosts,
      },
      privacy: isOwner
        ? {
            isPrivate: user.isPrivate,
            likedPostsVisibility: user.likedPostsVisibility,
            ratedPostsVisibility: user.ratedPostsVisibility,
          }
        : null,
    };
  }

  async editProfile(
    userId: number,
    avatar: Express.Multer.File | undefined,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const data: Partial<User> = {
      ...updateUserDto,
    };

    if (avatar) {
      data.avatar = avatar.buffer;
      data.avatarMimeType = avatar.mimetype;
    }

    const update = await this.usersRepository.update({ id: userId }, data);

    if (!update.affected) {
      return null;
    }

    return this.usersRepository.findOneBy({
      id: userId,
    });
  }

  async checkPassword(userId: number, password: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const isValid = await bcrypt.compare(password, user.password);
      return { isValid };
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Invalid password');
    }
  }

  async confirmNewPassword(newPassword: string, userId: number) {
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const updateInfo = await this.usersRepository.update(
      { id: userId },
      { password: newPasswordHash },
    );

    if (updateInfo.affected) {
      return { isChanged: true, message: 'Password successfully changed' };
    } else {
      throw new InternalServerErrorException('Error during changing password');
    }
  }

  async confirmNewEmail(newEmail: string, userId: number) {
    const updateInfo = await this.usersRepository.update(
      { id: userId },
      { email: newEmail },
    );
    if (updateInfo.affected) {
      return { isChanged: true, message: 'Email successfully changed' };
    } else {
      throw new InternalServerErrorException('Error during changing password');
    }
  }
}
