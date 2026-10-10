import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

    private readonly socketGateway: SocketGateway,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
    realtimeNotification: { title: string; text: string; type: string },
  ) {
    const newNotification = this.notificationRepository.create({
      ...createNotificationDto,
    });

    await this.notificationRepository.save(newNotification);

    this.socketGateway.sendToUser(
      createNotificationDto.recipientUserId,
      'notification:new',
      {
        title: realtimeNotification.title,
        text: realtimeNotification.text,
        type: realtimeNotification.type,
      },
    );
  }

  async notificationsList(recipientUserId: number) {
    const notifications = await this.notificationRepository.find({
      where: {
        recipientUserId,
      },
      relations: {
        actorUser: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const items = notifications.map((notification) => {
      const { actorUser, ...rest } = notification;

      return {
        ...rest,
        metadata: notification.metadata
          ? JSON.parse(notification.metadata)
          : null,
        actor: actorUser
          ? {
              id: actorUser.id,
              username: actorUser.username,
              avatarUrl: `/users/${actorUser.username}/avatar`,
            }
          : null,
      };
    });
    const groupedNotifications = items.reduce(
      (acc, notification) => {
        const actorId = notification.actorUserId;

        if (!actorId) {
          if (!acc['system']) {
            acc['system'] = {
              actor: 'system',
              notifications: [],
            };
          }
          acc['system'].notifications.push(notification);
        } else {
          if (!acc[actorId]) {
            acc[actorId] = {
              actor: actorId,
              notifications: [],
            };
          }
          acc[actorId].notifications.push(notification);
        }

        return acc;
      },
      {} as Record<
        number,
        {
          actor: number | 'system';
          notifications: {
            id: number;
            type: string;
            sourceType: string;
            entityType: string | null;
            entityId: number | null;
            title: string | null;
            text: string | null;
            content: string | null;
            isRead: boolean;
            createdAt: string;
            readAt: string | null;
            deleteAfterReadAt: string | null;
            metadata: string | null;
            recipientUserId: number;
            actorUserId: number | null;

            actor: {
              id: number;
              username: string;
              avatarUrl: string;
            } | null;
          }[];
        }
      >,
    );
    return {
      items: Object.values(groupedNotifications),
    };
  }

  getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { recipientUserId: userId, isRead: false },
    });
  }

  markAsRead(userId: number, notificationId: number, now: number) {
    this.notificationRepository.update(
      { id: notificationId, recipientUserId: userId, isRead: false },
      {
        readAt: String(now),
        deleteAfterReadAt: String(now + 3 * 24 * 60 * 60 * 1000),
        isRead: true,
      },
    );
  }

  markAllAsRead(now: number, userId: number) {
    this.notificationRepository.update(
      { recipientUserId: userId, isRead: false },
      {
        isRead: true,
        deleteAfterReadAt: String(now + 3 * 24 * 60 * 60 * 1000),
        readAt: String(now),
      },
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredReadNotifications() {
    const now = Date.now();
    this.notificationRepository.delete({
      isRead: true,
      deleteAfterReadAt: LessThanOrEqual(String(now)),
    });
  }

  deleteById(id: number) {
    this.notificationRepository.delete({ id });
  }
}
