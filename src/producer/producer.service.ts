import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Producer } from './producer.entity';
import { Repository } from 'typeorm';
import {
  ProducerAwardIntervalResponse,
  ProducerAwardInterval,
} from './producer.interface';
import { Movie } from '../movie/movie.entity';

@Injectable()
export class ProducerService {
  constructor(
    @InjectRepository(Producer)
    private readonly producerRepository: Repository<Producer>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findAll(): Promise<Producer[]> {
    return this.producerRepository.find({ relations: ['movies'] });
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

  /**
   * Retorna os produtores com maior e menor intervalo entre prêmios ganhos.
   * Considera apenas produtores com mais de uma vitória.
   */
  async calculateAwardIntervals(): Promise<ProducerAwardIntervalResponse> {
    try {
      // Busca todos os produtores e apenas os filmes vencedores de cada um
      const producers = await this.producerRepository.find({
        relations: ['movies'],
        where: {
          movies: {
            winner: true,
          },
        },
      });

      const intervals: ProducerAwardInterval[] = [];

      for (const producer of producers) {
        // Os filmes já vêm filtrados por winner: true
        const years = (producer.movies || [])
          .map((m) => m.year)
          .sort((a, b) => a - b);

        // Calcula os intervalos entre vitórias consecutivas
        for (let i = 1; i < years.length; i++) {
          intervals.push({
            producer: `${producer.id}-${producer.name}`,
            interval: years[i] - years[i - 1],
            previousWin: years[i - 1],
            followingWin: years[i],
          });
        }
      }

      // Verifica se nenhum intervalo encontrado (ex: todos os produtores com apenas uma vitória)
      if (!intervals.length) {
        return { min: [], max: [] };
      }

      // Determina os menores e maiores intervalos
      // Usa spread por conta do min e max não suportarem array
      const min = Math.min(...intervals.map((i) => i.interval));
      const max = Math.max(...intervals.map((i) => i.interval));

      return {
        min: intervals.filter((i) => i.interval === min),
        max: intervals.filter((i) => i.interval === max),
      };
    } catch (error) {
      throw new Error(`Erro ao calcular intervalos de prêmios: ${error}`);
    }
  }
}
