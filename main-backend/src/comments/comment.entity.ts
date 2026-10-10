import { Post } from 'src/posts/post.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('post_comments')
@Index('idx_post_comments_user', ['userId'])
@Index('idx_post_comments_parent', ['parentCommentId'])
@Index('idx_post_comments_post_created', ['postId', 'createdAt'])
export class PostComment {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ name: 'text', type: 'text', nullable: false })
  text!: string;

  @Column({ name: 'created_at', type: 'bigint', nullable: false })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'bigint', nullable: true })
  updatedAt!: string | null;

  @Column({ name: 'post_id', type: 'integer', nullable: false })
  postId!: number;

  @ManyToOne(() => Post, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_comments_post',
  })
  post!: Post;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_comments_user',
  })
  user!: User | null;

  @Column({ name: 'parent_comment_id', type: 'integer', nullable: true })
  parentCommentId!: number | null;

  @ManyToOne(() => PostComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'parent_comment_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_comments_parent',
  })
  parentComment!: PostComment | null;

  @OneToMany(() => PostComment, (comment) => comment.parentComment)
  replies!: PostComment[];
}
