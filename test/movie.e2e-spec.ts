import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../src/movie/movie.entity';
import { Server } from 'http';

describe('MovieController (e2e)', () => {
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

  it('GET /movies', async () => {
    const res = await request(app.getHttpServer() as Server).get('/movies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const movies = res.body as Movie[];
    if (movies.length > 0) {
      expect(movies[0]).toHaveProperty('id');
      expect(movies[0]).toHaveProperty('title');
      expect(movies[0]).toHaveProperty('year');
      expect(movies[0]).toHaveProperty('winner');
      expect(movies[0]).toHaveProperty('studios');
      expect(Array.isArray(movies[0].studios)).toBe(true);
      if (movies[0].studios.length > 0) {
        expect(movies[0].studios[0]).toHaveProperty('id');
        expect(movies[0].studios[0]).toHaveProperty('name');
      }
      expect(movies[0]).toHaveProperty('producers');
      expect(Array.isArray(movies[0].producers)).toBe(true);
      if (movies[0].producers.length > 0) {
        expect(movies[0].producers[0]).toHaveProperty('id');
        expect(movies[0].producers[0]).toHaveProperty('name');
      }
    }
  });

  it('Database seeded via CSV: there should be at least one movie, producer, and studio', async () => {
    const moviesRes = await request(app.getHttpServer() as Server).get(
      '/movies',
    );
    const studiosRes = await request(app.getHttpServer() as Server).get(
      '/studios',
    );
    const producersRes = await request(app.getHttpServer() as Server).get(
      '/producers',
    );
    expect((moviesRes.body as Movie[]).length).toBeGreaterThan(0);
    expect((studiosRes.body as any[]).length).toBeGreaterThan(0);
    expect((producersRes.body as any[]).length).toBeGreaterThan(0);
  });

  it('GET /movies should return an empty array if there are no movies', async () => {
    const movieRepository = app.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );
    await movieRepository.clear();
    const res = await request(app.getHttpServer() as Server).get('/movies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect((res.body as Movie[]).length).toBe(0);
  });
});
