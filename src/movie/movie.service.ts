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
import { MovieCsvRow } from './movie.interface';
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
    return await this.movieRepository.find({
      relations: ['studios', 'producers'],
      order: { year: 'ASC' },
    });
  }

  async importCsv(path: string): Promise<number> {
    const rows: MovieCsvRow[] = [];

    const loadCsv = () =>
      new Promise<void>((resolve, reject) => {
        fs.createReadStream(path)
          .pipe(csv({ separator: ';' }))
          .on('data', (row: MovieCsvRow) => rows.push(row))
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

    await loadCsv();

    const movies: Movie[] = [];

    for (const row of rows) {
      // Suporte a múltiplos estúdios separados por vírgula ou 'and'
      const studioNames = row.studios
        .split(/,| and /i)
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
      const studios: Studio[] = [];
      for (const name of studioNames) {
        let studio = await this.studioRepository.findOne({
          where: { name },
        });
        if (!studio) {
          studio = this.studioRepository.create({ name });
          studio = await this.studioRepository.save(studio);
        }
        studios.push(studio);
      }

      // Parse e normalização dos produtores
      const producerNames = row.producers
        .split(/,| and /i)
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
      const producers: Producer[] = [];
      for (const name of producerNames) {
        let producer = await this.producerRepository.findOne({
          where: { name },
        });
        if (!producer) {
          producer = this.producerRepository.create({ name });
          producer = await this.producerRepository.save(producer);
        }
        producers.push(producer);
      }

      const movie = this.movieRepository.create({
        year: row.year,
        title: row.title.trim(),
        winner: (row.winner || '').toLowerCase().includes('yes'),
        studios,
        producers,
      });

      movies.push(movie);
    }

    await this.movieRepository.save(movies);
    return movies.length;
  }

  async findOrCreateMovie(
    year: number,
    title: string,
    producers: Producer[],
    studios: Studio[],
  ): Promise<Movie> {
    const trimmedTitle = title.trim();
    let movie = await this.movieRepository.findOne({
      where: { year, title: trimmedTitle },
      relations: ['producers', 'studios'],
    });
    if (!movie) {
      movie = this.movieRepository.create({
        year,
        title: trimmedTitle,
        producers,
        studios,
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
