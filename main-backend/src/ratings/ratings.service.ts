import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRating } from './rating.entity';
import { Repository } from 'typeorm';
import { PostsService } from 'src/posts/posts.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(PostRating)
    private ratingsRepository: Repository<PostRating>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async getMeta(postId: number, userId: number) {
    const result = await this.ratingsRepository
      .createQueryBuilder('r')
      .select('COALESCE(ROUND(AVG(r.rating), 2), 0)', 'avgRating')
      .addSelect('COUNT(*)', 'ratingsCount')
      .addSelect(
        'MAX(CASE WHEN r.user_id = :userId THEN r.rating ELSE NULL END)',
        'myRating',
      )
      .where('r.post_id = :postId', { postId })
      .setParameter('userId', userId)
      .getRawOne();

    return {
      avgRating: Number(result.avgRating),
      ratingsCount: Number(result.ratingsCount),
      myRating: result.myRating !== null ? Number(result.myRating) : null,
    };
  }

  async getUserRatedPosts(userId: number) {
    const ratedPosts = await this.ratingsRepository.find({
      where: { userId },
      select: { post: true, user: true },
      relations: {
        post: { ratings: true, likes: true, user: true, comments: true },
        user: true,
      },
    });
    console.log(ratedPosts);
    return ratedPosts;
  }

  async ratePost(
    postId: number,
    actorUserId: number,
    rating: number,
    now: string,
  ) {
    const rate = await this.ratingsRepository.findOne({
      where: { postId, userId: actorUserId },
    });

    if (rate) {
      await this.ratingsRepository.update(
        { postId, userId: actorUserId },
        { rating, updatedAt: now },
      );
      return this.getMeta(postId, actorUserId);
    }

    const newRating = this.ratingsRepository.create({
      postId,
      userId: actorUserId,
      createdAt: now,
      updatedAt: now,
      rating,
    });
    await this.ratingsRepository.save(newRating);
    const savedRating = await this.ratingsRepository.findOne({
      where: { userId: actorUserId, postId },
      select: { post: { userId: true } },
      relations: { post: true },
    });

    if (savedRating && savedRating.post.userId !== actorUserId) {
      await this.notificationsService.create(
        {
          recipientUserId: savedRating.post.userId,
          actorUserId: actorUserId,
          type: 'rate',
          sourceType: 'user',
          entityType: 'post',
          entityId: postId,
          title: 'notification.rate_title',
          text: `notification.rate_text`,
          createdAt: now,
          metadata: JSON.stringify({ postId, rating }),
        },
        {
          title: 'notification.rate_title',
          text: 'notification.sm_rate_text',
          type: 'rate',
        },
      );
    }

    return this.getMeta(postId, actorUserId);
  }
}
