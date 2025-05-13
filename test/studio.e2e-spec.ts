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

describe('StudioController (e2e)', () => {
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

  it('GET /studios should return a list of studios', async () => {
    const res = await request(app.getHttpServer() as Server).get('/studios');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const studios = res.body as any[];
    if (studios.length > 0) {
      expect(studios[0]).toHaveProperty('id');
      expect(studios[0]).toHaveProperty('name');
    }
  });

  it('GET /studios should return an empty array if there are no studios', async () => {
    const movieRepository = app.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );
    await movieRepository.clear();
    const producerRepository = app.get<Repository<Producer>>(
      getRepositoryToken(Producer),
    );
    await producerRepository.clear();
    const studioRepository = app.get<Repository<Studio>>(
      getRepositoryToken(Studio),
    );
    await studioRepository.clear();
    const res = await request(app.getHttpServer() as Server).get('/studios');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const studios = res.body as any[];
    expect(studios.length).toBe(0);
  });
});
