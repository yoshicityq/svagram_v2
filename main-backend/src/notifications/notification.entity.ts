import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('notifications')
@Unique('uq_notifications_recipient_actor_entity', [
  'recipientUserId',
  'actorUserId',
  'type',
  'entityType',
  'entityId',
])
export class Notification {
  @PrimaryGeneratedColumn('identity', { type: 'integer' })
  id!: number;

  @Column({ type: 'text', nullable: false })
  type!: string;

  @Column({ name: 'source_type', type: 'text', nullable: false })
  sourceType!: string;

  @Column({ name: 'entity_type', type: 'text', nullable: true })
  entityType!: string | null;

  @Column({ name: 'entity_id', type: 'integer', nullable: true })
  entityId!: number | null;

  @Column({ type: 'text', nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  text!: string | null;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ name: 'is_read', type: 'boolean', nullable: false, default: false })
  isRead!: boolean;

  @Column({ name: 'created_at', type: 'bigint', nullable: false })
  createdAt!: string;

  @Column({ name: 'read_at', type: 'bigint', nullable: true })
  readAt!: string | null;

  @Column({ name: 'delete_after_read_at', type: 'bigint', nullable: true })
  deleteAfterReadAt!: string | null;

  @Column({ name: 'metadata', type: 'text', nullable: true })
  metadata!: string | null;

  @Column({ name: 'recipient_user_id', type: 'integer', nullable: false })
  recipientUserId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'recipient_user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_notifications_recipient_user',
  })
  recipientUser!: User;

  @Column({ name: 'actor_user_id', type: 'integer', nullable: true })
  actorUserId!: number | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'actor_user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_actor_user',
  })
  actorUser!: User | null;
}
