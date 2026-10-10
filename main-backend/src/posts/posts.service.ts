import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from 'src/users/users.service';
import { PostResponse } from 'src/interfaces/post';
import { PostData, PostResponseDto } from './dto/post-response.dto';
import { LikesService } from 'src/likes/likes.service';
import { RatingsService } from 'src/ratings/ratings.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
    private readonly likesService: LikesService,
    private readonly ratingsService: RatingsService,
  ) {}
  // Получение всех постов
  async findAll(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  async getPostById(id: number) {
    return this.postsRepository.findOne({ where: { id } });
  }
  //  Поиск по ID поста
  async findById(id: number, currentUserId: number): Promise<PostResponseDto> {
    // const post = await this.postsRepository.findOneBy({ id });
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: { likes: true, ratings: true, user: true, comments: true },
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    const likesCount = post.likes.length;
    const ratingsCount = post.ratings.length;
    const avgRating =
      ratingsCount > 0
        ? post.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
          ratingsCount
        : 0;
    const peopleLiked = post.likes.map((like) => like.userId);
    const myRating =
      post.ratings.find((rating) => rating.userId === currentUserId)?.rating ??
      null;
    const likedByMe = !!post.likes.find(
      (like) => like.userId === currentUserId,
    );
    const commentsCount = post.comments.length;
    return {
      user: { username: post.user.username, id: post.user.id },
      content: {
        id: post.id,
        imageUrl: `/posts/${post.id}/image`,
        description: post.description,
        latitude: post.latitude,
        longitude: post.longitude,
        date: post.date,
        categoryList: post.categoryList,
      },
      stats: {
        likesCount,
        peopleLiked,
        likedByMe,
        ratingsCount,
        avgRating,
        myRating,
        commentsCount,
      },
    };
  }

  // Создание поста
  async create(
    createPostDto: CreatePostDto,
    userId: number,
    image: Express.Multer.File,
  ): Promise<PostResponseDto> {
    const user = await this.usersService.findById(userId);

    const post = this.postsRepository.create({
      ...createPostDto,
      userId,
      image: image.buffer,
      imgMimeType: image.mimetype,
    });

    await this.postsRepository.save(post);

    return {
      user: { username: user.username, id: userId },
      content: {
        id: post.id,
        imageUrl: `/posts/${post.id}/image`,
        description: post.description,
        latitude: post.latitude,
        longitude: post.longitude,
        date: post.date,
        categoryList: post.categoryList,
      },
      stats: {
        likesCount: 0,
        ratingsCount: 0,
        avgRating: 0,
        peopleLiked: [],
        myRating: 0,
        likedByMe: false,
        commentsCount: 0,
      },
    };
  }
  // Получение постов для ленты
  async getFeedPosts(currentUserId: number): Promise<PostResponseDto[]> {
    const dbPosts = await this.postsRepository.find({
      relations: { user: true, likes: true, ratings: true, comments: true },
      order: { id: 'DESC' },
    });

    return dbPosts.map((post) => {
      const likesCount = post.likes.length;
      const ratingsCount = post.ratings.length;
      const avgRating =
        ratingsCount > 0
          ? post.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            ratingsCount
          : 0;
      const peopleLiked = post.likes.map((like) => like.userId);
      const myRating =
        post.ratings.find((rating) => rating.userId === currentUserId)
          ?.rating ?? null;
      const likedByMe = !!post.likes.find(
        (like) => like.userId === currentUserId,
      );
      const commentsCount = post.comments.length;
      return {
        user: {
          username: post.user.username,
          id: post.user.id,
        },
        content: {
          id: post.id,
          imageUrl: `/posts/${post.id}/image`,
          description: post.description,
          latitude: post.latitude,
          longitude: post.longitude,
          date: post.date,
          categoryList: post.categoryList,
        },
        stats: {
          likesCount,
          peopleLiked,
          likedByMe,
          ratingsCount,
          avgRating,
          myRating,
          commentsCount,
        },
      };
    });
  }

  //  Получение постов пользователя
  async getUserPosts(
    userId: number,
    currentUserId: number,
  ): Promise<PostResponseDto[]> {
    const dbPosts = await this.postsRepository.find({
      where: { userId },
      relations: { likes: true, ratings: true, comments: true, user: true },
      order: { date: 'DESC' },
    });
    if (dbPosts.length === 0) {
      return [];
    }
    const posts = dbPosts.map((post) => {
      const likesCount = post.likes.length;
      const ratingsCount = post.ratings.length;
      const avgRating =
        ratingsCount > 0
          ? post.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            ratingsCount
          : 0;
      const peopleLiked = post.likes.map((like) => like.userId);
      const myRating =
        post.ratings.find((rating) => rating.userId === currentUserId)
          ?.rating ?? null;
      const likedByMe = !!post.likes.find(
        (like) => like.userId === currentUserId,
      );
      const commentsCount = post.comments.length;
      return {
        user: { id: userId, username: post.user.username },
        content: {
          id: post.id,
          imageUrl: `/posts/${post.id}/image`,
          description: post.description,
          latitude: post.latitude,
          longitude: post.longitude,
          date: post.date,
          categoryList: post.categoryList,
        },
        stats: {
          likesCount,
          peopleLiked,
          avgRating,
          ratingsCount,
          myRating,
          likedByMe,
          commentsCount,
        },
      };
    });

    return posts;
  }

  // Получение лайкнутых постов
  async getUserLikedPosts(userId: number, currentUserId: number) {
    const likes = await this.likesService.getUserLikes(userId);
    const posts = likes.map((like) => {
      const likesCount = like.post.likes.length;
      const ratingsCount = like.post.ratings.length;
      const avgRating =
        ratingsCount > 0
          ? like.post.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            ratingsCount
          : 0;
      const peopleLiked = like.post.likes.map((like) => like.userId);
      const myRating =
        like.post.ratings.find((rating) => rating.userId === currentUserId)
          ?.rating ?? null;
      const likedByMe = !!like.post.likes.find(
        (like) => like.userId === currentUserId,
      );
      const commentsCount = like.post.comments.length;
      return {
        user: { id: like.post.user.id, username: like.post.user.username },
        content: {
          id: like.post.id,
          imageUrl: `/posts/${like.post.id}/image`,
          description: like.post.description,
          latitude: like.post.latitude,
          longitude: like.post.longitude,
          date: like.post.date,
          categoryList: like.post.categoryList,
        },
        stats: {
          likesCount,
          peopleLiked,
          avgRating,
          ratingsCount,
          myRating,
          likedByMe,
          commentsCount,
        },
      };
    });
    return posts;
  }

  // Получение оцененных постов
  async getUserRatedPosts(userId: number, currentUserId: number) {
    const ratings = await this.ratingsService.getUserRatedPosts(userId);
    const posts = ratings.map((rate) => {
      const likesCount = rate.post.likes.length;
      const ratingsCount = rate.post.ratings.length;
      const avgRating =
        ratingsCount > 0
          ? rate.post.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            ratingsCount
          : 0;
      const peopleLiked = rate.post.likes.map((like) => like.userId);
      const myRating =
        rate.post.ratings.find((rating) => rating.userId === currentUserId)
          ?.rating ?? null;
      const likedByMe = !!rate.post.likes.find(
        (like) => like.userId === currentUserId,
      );
      const commentsCount = rate.post.comments.length;
      return {
        user: { id: rate.post.user.id, username: rate.post.user.username },
        content: {
          id: rate.post.id,
          imageUrl: `/posts/${rate.post.id}/image`,
          description: rate.post.description,
          latitude: rate.post.latitude,
          longitude: rate.post.longitude,
          date: rate.post.date,
          categoryList: rate.post.categoryList,
        },
        stats: {
          likesCount,
          peopleLiked,
          avgRating,
          ratingsCount,
          myRating,
          likedByMe,
          commentsCount,
        },
      };
    });
    return posts;
  }

  // Получение фото поста
  async getPostImage(postId: number) {
    const imageData = await this.postsRepository.findOne({
      where: { id: postId },
      select: { image: true, imgMimeType: true },
    });

    if (!imageData) {
      throw new NotFoundException('Post image not found');
    }

    return {
      image: imageData.image,
      imgMimeType: imageData.imgMimeType,
    };
  }
}
