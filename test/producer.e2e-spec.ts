import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../src/movie/movie.entity';
import { Producer } from '../src/producer/producer.entity';
import { Studio } from '../src/studio/studio.entity';
import { Server } from 'http';
import { ProducerAwardInterval } from 'src/producer/producer.interface';

describe('ProducerController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /producers should return a list of producers', async () => {
    const res = await request(app.getHttpServer() as Server).get('/producers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const producers = res.body as Producer[];
    if (producers.length > 0) {
      expect(producers[0]).toHaveProperty('id');
      expect(producers[0]).toHaveProperty('name');
    }
  });

  it('GET /producers/award-interval should return min and max arrays', async () => {
    const res = await request(app.getHttpServer() as Server).get(
      '/producers/award-interval',
    );
    expect(res.status).toBe(200);
    const interval = res.body as {
      min: ProducerAwardInterval[];
      max: ProducerAwardInterval[];
    };
    expect(interval).toHaveProperty('min');
    expect(interval).toHaveProperty('max');
    expect(Array.isArray(interval.min)).toBe(true);
    expect(Array.isArray(interval.max)).toBe(true);
  });

  it('GET /producers should return an empty array if there are no producers', async () => {
    const movieRepository = app.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );
    await movieRepository.clear();
    const producerRepository = app.get<Repository<Producer>>(
      getRepositoryToken(Producer),
    );
    await producerRepository.clear();
    const res = await request(app.getHttpServer() as Server).get('/producers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const producers = res.body as Producer[];
    expect(producers.length).toBe(0);
  });

  it('GET /producers/award-interval should return empty min and max arrays if there are no producers', async () => {
    const movieRepository = app.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );
    await movieRepository.clear();
    const producerRepository = app.get<Repository<Producer>>(
      getRepositoryToken(Producer),
    );
    await producerRepository.clear();
    const res = await request(app.getHttpServer() as Server).get(
      '/producers/award-interval',
    );
    const interval = res.body as {
      min: ProducerAwardInterval[];
      max: ProducerAwardInterval[];
    };
    expect(res.status).toBe(200);
    expect(interval).toHaveProperty('min');
    expect(interval).toHaveProperty('max');
    expect(Array.isArray(interval.min)).toBe(true);
    expect(Array.isArray(interval.max)).toBe(true);
    expect(interval.min.length).toBe(0);
    expect(interval.max.length).toBe(0);
  });

  it('GET /studios should return an empty array if there are no studios', async () => {
    const movieRepository = app.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );
    await movieRepository.clear();
    const studioRepository = app.get<Repository<Studio>>(
      getRepositoryToken(Studio),
    );
    await studioRepository.clear();
    const res = await request(app.getHttpServer() as Server).get('/studios');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const studios = res.body as Studio[];
    expect(studios.length).toBe(0);
  });

  it('GET /producers/award-interval should return empty min and max arrays if no producer has more than one win', async () => {
    const movieRepository = app.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );
    const producerRepository = app.get<Repository<Producer>>(
      getRepositoryToken(Producer),
    );
    await movieRepository.clear();
    await producerRepository.clear();
    // Seed only single-win producers
    const p1 = await producerRepository.save({ name: 'Single Winner 1' });
    const p2 = await producerRepository.save({ name: 'Single Winner 2' });
    await movieRepository.save({
      year: 2000,
      title: 'Only Win 1',
      winner: true,
      studio: { id: 1, name: 'Studio 1' },
      producer: p1,
    });
    await movieRepository.save({
      year: 2001,
      title: 'Only Win 2',
      winner: true,
      studio: { id: 2, name: 'Studio 2' },
      producer: p2,
    });
    const res = await request(app.getHttpServer() as Server).get(
      '/producers/award-interval',
    );
    const interval = res.body as {
      min: ProducerAwardInterval[];
      max: ProducerAwardInterval[];
    };
    expect(res.status).toBe(200);
    expect(interval).toHaveProperty('min');
    expect(interval).toHaveProperty('max');
    expect(Array.isArray(interval.min)).toBe(true);
    expect(Array.isArray(interval.max)).toBe(true);
    expect(interval.min.length).toBe(0);
    expect(interval.max.length).toBe(0);
  });
});
