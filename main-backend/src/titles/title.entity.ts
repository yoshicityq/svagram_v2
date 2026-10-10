import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('titles')
export class Title {
  @PrimaryGeneratedColumn('identity', { type: 'integer' })
  id!: number;

  @Column({ name: 'title_name', type: 'text', nullable: false })
  titleName!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => User, (user) => user.title, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  users!: User[];
}
