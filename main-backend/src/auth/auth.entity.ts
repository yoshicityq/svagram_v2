import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('auth_sessions')
export class AuthSession {
  @PrimaryColumn({ name: 'jti', type: 'text', nullable: false })
  jti!: string;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId!: number;

  @Column({ name: 'revoked', type: 'boolean', nullable: false, default: false })
  revoked!: boolean;

  @Column({ name: 'expires_at', type: 'bigint', nullable: false })
  expiresAt!: string;

  @Column({ name: 'created_at', type: 'bigint', nullable: false })
  createdAt!: string;
}
