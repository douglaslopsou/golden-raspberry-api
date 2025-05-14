import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie/movie.entity';
import { Studio } from './studio/studio.entity';
import { Producer } from './producer/producer.entity';
import { MovieModule } from './movie/movie.module';
import { StudioModule } from './studio/studio.module';
import { ProducerModule } from './producer/producer.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'src/database/golden-raspberry-api.sqlite',
      entities: [Movie, Studio, Producer],
      synchronize: true,
    }),
    MovieModule,
    StudioModule,
    ProducerModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
