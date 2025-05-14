import { Controller, Get } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieResponse } from './movie.interface';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async findAll(): Promise<MovieResponse[]> {
    return this.movieService.findAll();
  }
}
