export interface UserInfo {
  id: number;
  username: string;
  city: string | null;
  description: string | null;
  favorite_brands: string[] | null;
  avatarUrl: string | null;
  title: {
    id: number;
    titleName: string;
  } | null;
  //   titleName: string | null;
  role: string;
}

export interface UserPermissions {
  isOwner: boolean;
  canViewPosts: boolean;
  canViewLikedPosts: boolean;
  canViewRatedPosts: boolean;
}

export interface UserPrivacy {
  isPrivate: boolean;
  likedPostsVisibility: string;
  ratedPostsVisibility: string;
}
