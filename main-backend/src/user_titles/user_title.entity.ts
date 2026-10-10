import { Title } from 'src/titles/title.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('user_titles')
export class UserTitle {
  @PrimaryColumn({
    name: 'user_id',
    type: 'integer',
    nullable: false,
    primaryKeyConstraintName: 'pk_user_titles',
  })
  userId!: number;

  @PrimaryColumn({
    name: 'title_id',
    type: 'integer',
    nullable: false,
    primaryKeyConstraintName: 'pk_user_titles',
  })
  titleId!: number;

  @Column({ name: 'earned_at', type: 'bigint', nullable: false })
  earnedAt!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_users_titles_user',
  })
  user!: User;

  @ManyToOne(() => Title, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'title_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_titles_title',
  })
  title!: Title;
}
