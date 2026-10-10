import { Transform } from 'class-transformer';
import { PostComment } from 'src/comments/comment.entity';
import { Category } from 'src/interfaces/category';
import { PostLike } from 'src/likes/like.entity';
import { PostRating } from 'src/ratings/rating.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('identity', { type: 'integer' })
  id!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'bytea', nullable: false })
  image!: Buffer;

  @Column({ name: 'img_mime_type', type: 'text', nullable: false })
  imgMimeType!: string;

  @Column({ type: 'text', nullable: true })
  latitude!: string | null;

  @Column({ type: 'text', nullable: true })
  longitude!: string | null;

  @Column({ type: 'bigint', nullable: false })
  date!: string;

  @Transform(({ value }) => {
    if (!value) return null;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @Column({ name: 'category_list', type: 'jsonb', nullable: true })
  categoryList!: Category[] | null;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId!: number;

  @ManyToOne(() => User, (user) => user.posts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_posts_user',
  })
  user!: User;

  @OneToMany(() => PostLike, (like) => like.post)
  likes!: PostLike[];

  @OneToMany(() => PostRating, (rating) => rating.post)
  ratings!: PostRating[];

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments!: PostComment[];
}
