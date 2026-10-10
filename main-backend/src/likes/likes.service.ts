import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostLike } from './like.entity';
import { DataSource, Repository } from 'typeorm';
import { PostsService } from 'src/posts/posts.service';
import { Post } from 'src/posts/post.entity';
import { Notification } from 'src/notifications/notification.entity';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(PostLike) private likesRepository: Repository<PostLike>,
    private readonly dataSource: DataSource,
    private readonly socketGateway: SocketGateway,
  ) {}

  async toggleLike(postId: number, userId: number, now: string) {
    return this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(Post, {
        where: { id: postId },
      });
      if (!post) return;
      const existingLike = await manager.findOne(PostLike, {
        where: { postId, userId },
      });

      let liked: boolean;
      if (!existingLike) {
        await manager.save(PostLike, {
          postId,
          userId,
          createdAt: now,
        });
        liked = true;
      } else {
        await manager.delete(PostLike, { postId, userId });
        await manager.delete(Notification, {
          recipientUserId: post?.userId,
          actorUserId: userId,
          type: 'like',
          entityType: 'post',
          entityId: postId,
        });
        liked = false;
      }
      if (liked && post?.userId !== userId) {
        const likeNotification = manager.create(Notification, {
          recipientUserId: post?.userId,
          actorUserId: userId,
          type: 'like',
          sourceType: 'user',
          entityType: 'post',
          entityId: postId,
          title: 'notification.like_title',
          text: 'notification.like_text',
          createdAt: now,
          metadata: JSON.stringify({ postId }),
        });
        await manager.save(Notification, likeNotification);
        this.socketGateway.sendToUser(post?.userId, 'notification:new', {
          title: 'notification.like_title',
          text: 'notification.sm_like_text',
          type: 'like',
        });
      }

      const likesCount = await manager.count(PostLike, { where: { postId } });

      return { liked, likesCount };
    });
  }

  async getUserLikes(userId: number) {
    const likedPosts = await this.likesRepository.find({
      where: { userId },
      select: { post: true, user: true },
      relations: {
        post: { ratings: true, likes: true, user: true, comments: true },
        user: true,
      },
    });
    return likedPosts;
  }
}
