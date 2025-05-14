import { Producer } from '../producer/producer.entity';
import { Studio } from '../studio/studio.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column()
  title: string;

  @Column({ default: false })
  winner: boolean;

  @ManyToMany(() => Studio, (studio) => studio.movies)
  @JoinTable()
  studios: Studio[];

  @ManyToMany(() => Producer, (producer) => producer.movies)
  @JoinTable()
  producers: Producer[];
}
