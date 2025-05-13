import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Producer } from './producer.entity';
import { Repository } from 'typeorm';
import { ProducerAwardIntervalResponse } from './producer.interface';

@Injectable()
export class ProducerService {
  constructor(
    @InjectRepository(Producer)
    private readonly producerRepository: Repository<Producer>,
  ) {}

  async findAll(): Promise<Producer[]> {
    return this.producerRepository.find();
  }

  async findOrCreateProducer(name: string): Promise<Producer> {
    const trimmed = name.trim();
    let producer = await this.producerRepository.findOne({
      where: { name: trimmed },
    });
    if (!producer) {
      producer = this.producerRepository.create({ name: trimmed });
      producer = await this.producerRepository.save(producer);
    }
    return producer;
  }

  async calculateAwardIntervals(): Promise<ProducerAwardIntervalResponse> {
    const producers = await this.producerRepository
      .createQueryBuilder('producer')
      .leftJoinAndSelect('producer.movies', 'movie')
      .where('movie.winner = true')
      .orderBy('movie.year', 'ASC')
      .getMany();

    const intervals: {
      producer: string;
      interval: number;
      previousWin: number;
      followingWin: number;
    }[] = [];

    for (const producer of producers) {
      const years = producer.movies
        .map((movie) => movie.year)
        .sort((a, b) => a - b);
      for (let i = 1; i < years.length; i++) {
        intervals.push({
          producer: producer.name,
          interval: years[i] - years[i - 1],
          previousWin: years[i - 1],
          followingWin: years[i],
        });
      }
    }

    if (intervals.length === 0) {
      return { min: [], max: [] };
    }

    const minInterval = Math.min(...intervals.map((r) => r.interval));
    const maxInterval = Math.max(...intervals.map((r) => r.interval));

    return {
      min: intervals.filter((r) => r.interval === minInterval),
      max: intervals.filter((r) => r.interval === maxInterval),
    };
  }
}
