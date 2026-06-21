import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { CacheService } from '../src/modules/redis/cache.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        keys: jest.fn().mockResolvedValue([]),
        on: jest.fn(),
      })
      .overrideProvider(CacheService)
      .useValue({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        invalidatePattern: jest.fn(),
        getOrSet: jest.fn().mockImplementation((key, cb) => cb()), // bypass cache and call query directly
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 30000); // 30s timeout for initialization

  afterAll(async () => {
    await app.close();
  });

  it('/api/categories (GET) - Kategori listesini getirir', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/api/categories')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/api/products (GET) - Ürün listesini getirir', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
