import { Post } from 'src/posts/post.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Unique } from 'typeorm';

@Entity('post_likes')
@Unique(['postId', 'userId'])
export class PostLike {
  @Column({ name: 'created_at', type: 'bigint', nullable: false })
  createdAt!: string;

  @PrimaryColumn({ name: 'post_id', type: 'integer', nullable: false })
  postId!: number;

  @PrimaryColumn({ name: 'user_id', type: 'integer', nullable: false })
  userId!: number;

  @ManyToOne(() => Post, (post) => post.likes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_likes_post',
  })
  post!: Post;

  @ManyToOne(() => User, (user) => user.likes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_likes_user',
  })
  user!: User;
}
