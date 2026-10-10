export interface SessionToken {
  jti: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}
