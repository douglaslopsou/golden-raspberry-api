import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Producer } from './producer.entity';
import { Repository } from 'typeorm';
import {
  ProducerAwardIntervalResponse,
  ProducerAwardInterval,
  ProducerYears,
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
      // Busca todos os filmes vencedores com seus produtores
      const winnerMovies = await this.movieRepository.find({
        where: { winner: true },
        relations: ['producers'],
      });

      const producerYearsList: ProducerYears[] = [];

      // Percore cada filme vencedor e adiciona o ano de lançamento ao produtor
      for (const movie of winnerMovies) {
        for (const producer of movie.producers) {
          // Verifica se o produtor já existe na lista
          let entry = producerYearsList.find(
            (producerItem) => producerItem.id === producer.id,
          );
          if (!entry) {
            // Se não existir, cria um novo produtor na lista
            entry = { id: producer.id, name: producer.name, years: [] };
            producerYearsList.push(entry);
          }
          // Adiciona o ano de lançamento ao produtor caso não exista
          if (!entry.years.includes(movie.year)) {
            entry.years.push(movie.year);
          }
        }
      }

      // Calcula os intervalos
      const intervals: ProducerAwardInterval[] = [];
      for (const producer of producerYearsList) {
        // Verifica se o produtor tem mais de um ano de lançamento
        if (producer.years.length < 2) continue;
        // Ordena os anos de lançamento
        producer.years.sort((a, b) => a - b);
        // Calcula os intervalos entre os anos de lançamento
        for (let i = 1; i < producer.years.length; i++) {
          intervals.push({
            producer: producer.name,
            interval: producer.years[i] - producer.years[i - 1],
            previousWin: producer.years[i - 1],
            followingWin: producer.years[i],
          });
        }
      }

      // Verifica se há intervalos
      if (!intervals.length) {
        return { min: [], max: [] };
      }

      // Calcula o menor e maior intervalo usando a função Math.min e Math.max com spread operator
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
