import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTitle } from './user_title.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserTitlesService {
  constructor(
    @InjectRepository(UserTitle)
    private userTitlesRepository: Repository<UserTitle>,
  ) {}

  async grantTitle(userId: number, titleId: number, earnedAt: string) {
    const newGrant = this.userTitlesRepository.create({
      userId,
      titleId,
      earnedAt,
    });
    this.userTitlesRepository.save(newGrant);
  }

  async getUserTitlesList(userId: number) {
    const dbTitles = await this.userTitlesRepository.find({
      where: { userId },
      select: { title: { titleName: true } },
      relations: { title: true },
    });

    return dbTitles.map((title) => {
      return {
        id: title.titleId,
        titleName: title.title.titleName,
      };
    });
  }
}
