import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { Studio } from '../studio/studio.entity';
import { Producer } from '../producer/producer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Studio, Producer])],
  providers: [MovieService],
  controllers: [MovieController],
})
export class MovieModule {}
