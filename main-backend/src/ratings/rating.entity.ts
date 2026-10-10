import { Post } from 'src/posts/post.entity';
import { User } from 'src/users/user.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('post_ratings')
@Unique(['postId', 'userId'])
@Check('chk_post_rating', `"rating" BETWEEN 1 AND 5`)
export class PostRating {
  @PrimaryColumn({ name: 'post_id', type: 'integer', nullable: false })
  postId!: number;

  @PrimaryColumn({ name: 'user_id', type: 'integer', nullable: false })
  userId!: number;

  @Column({ name: 'created_at', type: 'bigint', nullable: false })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'bigint', nullable: false })
  updatedAt!: string;

  @Column({ name: 'rating', type: 'integer', nullable: false })
  rating!: number;

  @ManyToOne(() => User, (user) => user.ratings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_ratings_user',
  })
  user!: User;

  @ManyToOne(() => Post, (post) => post.ratings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_ratings_post',
  })
  post!: Post;
}
