import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { Repository } from 'typeorm';
import { Studio } from '../studio/studio.entity';
import { Producer } from '../producer/producer.entity';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectRepository(Movie) private movieRepository: Repository<Movie>,
    @InjectRepository(Studio) private studioRepository: Repository<Studio>,
    @InjectRepository(Producer)
    private producerRepository: Repository<Producer>,
  ) {}

  async findAll(): Promise<Movie[]> {
    return this.movieRepository.find({
      relations: ['studio', 'producer'],
      order: { year: 'ASC' },
    });
  }

  async importCsv(path: string): Promise<number> {
    const rows: {
      year: number;
      title: string;
      winner: string;
      studios: string;
      producers: string;
    }[] = [];

    const loadCsv = () =>
      new Promise<void>((resolve, reject) => {
        fs.createReadStream(path)
          .pipe(csv({ separator: ';' }))
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

    await loadCsv();

    const movies: Movie[] = [];

    for (const row of rows) {
      let studio = await this.studioRepository.findOne({
        where: { name: row.studios.trim() },
      });
      if (!studio) {
        studio = this.studioRepository.create({ name: row.studios.trim() });
        studio = await this.studioRepository.save(studio);
      }

      const producerName = row.producers.trim();
      let producer = await this.producerRepository.findOne({
        where: { name: producerName },
      });
      if (!producer) {
        producer = this.producerRepository.create({ name: producerName });
        producer = await this.producerRepository.save(producer);
      }

      const movie = this.movieRepository.create({
        year: row.year,
        title: row.title.trim(),
        winner: (row.winner || '').toLowerCase().includes('yes'),
        studio,
        producer,
      });

      movies.push(movie);
    }

    await this.movieRepository.save(movies);
    return movies.length;
  }

  async findOrCreateMovie(
    year: number,
    title: string,
    producer: Producer,
    studio: Studio,
  ): Promise<Movie> {
    const trimmedTitle = title.trim();
    let movie = await this.movieRepository.findOne({
      where: { year, title: trimmedTitle },
      relations: ['producer', 'studio'],
    });
    if (!movie) {
      movie = this.movieRepository.create({
        year,
        title: trimmedTitle,
        producer,
        studio,
      });
      movie = await this.movieRepository.save(movie);
    }
    return movie;
  }

  async onModuleInit() {
    const csvPath =
      process.env.CSV_FILE_PATH ||
      join(__dirname, '..', '..', 'src', 'files', 'movielist_1.csv');
    if (!fs.existsSync(csvPath)) {
      this.logger.error(`CSV file not found at path: ${csvPath}`);
      return;
    }
    try {
      const count = await this.importCsv(csvPath);
      this.logger.log(`🎬 ${count} movies imported from ${csvPath}`);
    } catch (error: any) {
      this.logger.error('Error importing CSV on startup:', error);
    }
  }
}
