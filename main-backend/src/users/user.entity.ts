import { Post } from 'src/posts/post.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostsVisibility } from './enums/privacy';
import { PostLike } from 'src/likes/like.entity';
import { PostRating } from 'src/ratings/rating.entity';
import { Title } from 'src/titles/title.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('identity', { type: 'integer' })
  id!: number;

  @Column({ type: 'text', nullable: false, unique: true })
  email!: string;

  @Column({ type: 'text', nullable: false, unique: true })
  username!: string;

  @Column({ type: 'text', nullable: false })
  password!: string;

  @Column({ type: 'text', nullable: true })
  city!: string | null;

  @Column({ name: 'avatar', type: 'bytea', nullable: true })
  avatar!: Buffer | null;

  @Column({ name: 'avatar_mime_type', type: 'text', nullable: true })
  avatarMimeType!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'favorite_brands',
    type: 'text',
    array: true,
    nullable: true,
  })
  favoriteBrands!: string[] | null;

  @Column({ name: 'title_id', type: 'integer', nullable: true, default: null })
  titleId!: number | null;

  @ManyToOne(() => Title, (title) => title.users, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'title_id',
    referencedColumnName: 'id',
  })
  title!: Title | null;
  @Column({
    name: 'is_private',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isPrivate!: boolean;

  @Column({
    name: 'liked_posts_visibility',
    type: 'text',
    nullable: false,
    default: PostsVisibility.PRIVATE,
  })
  likedPostsVisibility!: PostsVisibility;

  @Column({
    name: 'rated_posts_visibility',
    type: 'text',
    nullable: false,
    default: PostsVisibility.PUBLIC,
  })
  ratedPostsVisibility!: PostsVisibility;

  @Column({ type: 'text', nullable: false, default: 'user' })
  role!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @OneToMany(() => PostLike, (like) => like.user)
  likes!: PostLike[];

  @OneToMany(() => PostRating, (rating) => rating.user)
  ratings!: PostRating[];
}
