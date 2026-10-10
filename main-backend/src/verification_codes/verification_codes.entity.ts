import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('verification_codes')
// @Index('idx_user_titles_title_id', ['titleId'])
export class VerificationCode {
  @PrimaryGeneratedColumn('identity', { type: 'integer' })
  id!: number;

  @Column({ name: 'type', type: 'text', nullable: false })
  type!: string;

  @Column({ name: 'code_hash', type: 'text', nullable: false })
  codeHash!: string;

  @Column({ name: 'new_email', type: 'text', nullable: true })
  newEmail!: string | null;

  @Column({ name: 'created_at', type: 'bigint', nullable: false })
  createdAt!: string;

  @Column({ name: 'expires_at', type: 'bigint', nullable: false })
  expiresAt!: string;

  @Column({
    name: 'attempts_count',
    type: 'integer',
    nullable: true,
    default: 0,
  })
  attemptsCount!: number | null;

  @Column({ name: 'used', type: 'boolean', nullable: true, default: false })
  used!: boolean;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userId!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_verification_codes_user',
  })
  user!: User;
}
