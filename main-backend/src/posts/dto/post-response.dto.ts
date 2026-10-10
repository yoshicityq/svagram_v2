import { Category } from 'src/interfaces/category';

export class PostResponseDto {
  user!: PostUserData;
  content!: PostData;
  stats!: PostStatsData;
}

export class PostUserData {
  username!: string;
  id!: number;
}

export class PostData {
  id!: number;
  imageUrl!: string;
  description!: string | null;
  latitude!: string | null;
  longitude!: string | null;
  date!: string;
  categoryList!: Category[] | null;
}

export class PostStatsData {
  likesCount: number;
  peopleLiked: number[];
  avgRating: number;
  ratingsCount: number;
  myRating: number | null;
  likedByMe: boolean;
  commentsCount: number;
  // commentsCount: number;
}
