jest.setTimeout(40000);

import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer();
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Ensure database is clean by dropping and recreating schema
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform full CRUD flow on /products', async () => {
    // CREATE
    const createDto = {
      name: 'E2E Test Product',
      description: 'Created during e2e test',
      price: 9.99,
      stock: 42,
    };
    const createRes = await request(httpServer)
      .post('/products')
      .send(createDto)
      .expect(HttpStatus.CREATED);

    const created = createRes.body;
    expect(created).toHaveProperty('id');
    expect(created.name).toBe(createDto.name);
    const id = created.id;

    // LIST
    const listRes = await request(httpServer)
      .get('/products')
      .query({ page: 1, limit: 10 })
      .expect(HttpStatus.OK);

    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.some((p: any) => p.id === id)).toBe(true);

    // GET single
    const getRes = await request(httpServer)
      .get(`/products/${id}`)
      .expect(HttpStatus.OK);

    expect(getRes.body.id).toBe(id);
    expect(getRes.body.name).toBe(createDto.name);

    // UPDATE
    const updateDto = { price: 19.99, stock: 100 };
    const updateRes = await request(httpServer)
      .patch(`/products/${id}`)
      .send(updateDto)
      .expect(HttpStatus.OK);

    expect(updateRes.body.id).toBe(id);
    expect(Number(updateRes.body.price)).toBe(updateDto.price);
    expect(updateRes.body.stock).toBe(updateDto.stock);

    // DELETE
    await request(httpServer)
      .delete(`/products/${id}`)
      .expect(HttpStatus.NO_CONTENT);

    // VERIFY DELETE -> should return 404 Not Found
    await request(httpServer)
      .get(`/products/${id}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect((res) => {
        expect(res.body).toHaveProperty('statusCode', HttpStatus.NOT_FOUND);
        expect(res.body.message).toContain(`Product with id=${id} not found`);
      });
  });
});
