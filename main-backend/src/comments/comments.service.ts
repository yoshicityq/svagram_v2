import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComment } from './comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comm.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(PostComment)
    private commentsRepository: Repository<PostComment>,
    private readonly notificationsService: NotificationsService,
    private readonly postsService: PostsService,
  ) {}

  async publishComment(
    postId: number,
    actorUserId: number,
    now: string,
    createCommentDto: CreateCommentDto,
  ) {
    const commentData = this.commentsRepository.create({
      postId,
      userId: actorUserId,
      createdAt: now,
      ...createCommentDto,
    });

    const targetPost = await this.postsService.findById(postId, actorUserId);

    const savedComm = await this.commentsRepository.save(commentData);

    const newComment = await this.commentsRepository.findOne({
      where: { id: savedComm.id },
      relations: { user: true },
    });
    if (!newComment) {
      throw new InternalServerErrorException('error');
    }
    if (targetPost && actorUserId !== targetPost.user.id) {
      await this.notificationsService.create(
        {
          recipientUserId: targetPost.user.id,
          actorUserId: actorUserId,
          type: 'comment',
          sourceType: 'user',
          entityType: 'post',
          entityId: newComment.postId,
          title: 'notification.comment_title',
          text: `notification.comment_text`,
          createdAt: now,
          content: createCommentDto.text,
          metadata: JSON.stringify({
            postId,
            commentId: newComment.id,
            parentCommentId: newComment.parentCommentId,
          }),
        },
        {
          title: 'notification.comment_title',
          text: 'notification.sm_comment_text',
          type: 'comment',
        },
      );
    }

    return {
      commentData: {
        id: newComment.id,
        postId: newComment.postId,
        text: newComment.text,
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
        parentCommentId: newComment.parentCommentId,
        isMine: true,
      },
      userData: {
        userId: newComment.userId,
        username: newComment.user?.username,
        avatarUrl: newComment.user?.avatarMimeType
          ? `/users/${newComment.user.username}/avatar`
          : null,
      },
    };
  }

  async getPostComments(postId: number, currentUserId: number) {
    const dbComments = await this.commentsRepository.find({
      where: { postId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });

    return dbComments.map((comm) => {
      return {
        commentData: {
          id: comm.id,
          postId: comm.postId,
          text: comm.text,
          createdAt: comm.createdAt,
          updatedAt: comm.updatedAt,
          parentCommentId: comm.parentCommentId,
          isMine: comm.userId === currentUserId ? true : false,
        },
        userData: {
          userId: comm.userId,
          username: comm.user?.username,
          avatarUrl: comm.user?.avatarMimeType
            ? `/users/${comm.user.username}/avatar`
            : null,
        },
      };
    });
  }
}
