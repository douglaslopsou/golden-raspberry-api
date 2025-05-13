import { Controller, Get } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieResponse } from './movie.interface';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async findAll(): Promise<MovieResponse[]> {
    const movies = await this.movieService.findAll();
    return movies.map((movie) => ({
      id: movie.id,
      year: movie.year,
      title: movie.title,
      winner: movie.winner,
      studio: {
        id: movie.studio.id,
        name: movie.studio.name,
      },
      producer: {
        id: movie.producer.id,
        name: movie.producer.name,
      },
    }));
  }
}
