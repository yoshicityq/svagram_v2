export interface SearchOptions {
  limit?: number;
  offset?: number;
}

export interface UserSearchOptions {
  id: number;
  username: string;
  avatarMimeType: string | null;
}
