import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import type { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotificationsList(@Req() req: Request): Promise<Record<
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
  > | null> {
    return this.notificationsService.notificationsList(Number(req['user'].sub));
  }

  @Get('/unread-count')
  async getUnreadCount(@Req() req: Request): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationsService.getUnreadCount(
      Number(req['user'].sub) ?? 0,
    );

    return {
      unreadCount,
    };
  }

  @Patch('/:id/read')
  markAsRead(
    @Param('id', ParseIntPipe) notificationId: number,
    @Req() req: Request,
  ) {
    const userId = Number(req['user'].sub);
    const now = Date.now();
    this.notificationsService.markAsRead(userId, notificationId, now);
  }

  @Patch('/read-all')
  markAllAsRead(@Req() req: Request) {
    const now = Date.now();
    const userId = Number(req['user'].sub);
    this.notificationsService.markAllAsRead(now, userId);
  }
}
