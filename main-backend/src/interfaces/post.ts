import { Category } from './category';

export interface PostResponse {
  user: { username: string; id: number };
  post: {
    id: number;
    imageUrl: string;
    description: string | null;
    latitude: string | null;
    longitude: string | null;
    date: string;
    categoryList: Category[] | null;
    likes: number;
    peopleLiked: number[] | null;
  };
}
