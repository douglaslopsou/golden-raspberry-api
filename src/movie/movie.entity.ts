import { Producer } from '../producer/producer.entity';
import { Studio } from '../studio/studio.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

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

  @ManyToOne(() => Studio, (studio) => studio.movies, {
    cascade: true,
    eager: true,
  })
  studio: Studio;

  @ManyToOne(() => Producer, (producer) => producer.movies, {
    cascade: true,
    eager: true,
  })
  producer: Producer;
}
