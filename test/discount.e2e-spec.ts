import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../src/user/user.repository';
import { DiscountType } from '../src/discount/discount.entity';
import { Role } from '../src/user/libs/enums/roles.enum';

describe('DiscountController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let createdDiscountId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    const userRepo = moduleFixture.get<UserRepository>(UserRepository);

    // create admin user
    const admin = await userRepo.create({
      email: 'admin-e2e@example.com',
      password: 'hashedpassword',
      role: Role.ADMIN,
    });
    adminToken = jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // create regular user
    const user = await userRepo.create({
      email: 'user-e2e@example.com',
      password: 'hashedpassword',
      role: Role.USER,
    });
    userToken = jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const adminAuth = () => ({ Authorization: `Bearer ${adminToken}` });
  const userAuth = () => ({ Authorization: `Bearer ${userToken}` });

  describe('As Admin', () => {
    it('POST /discounts should create a discount', async () => {
      await request(httpServer)
        .post('/discounts')
        .set(adminAuth())
        .send({
          code: 'E2EADMIN',
          type: DiscountType.PERCENTAGE,
          amount: 25,
          isActive: true,
        })
        .expect(HttpStatus.CREATED)
        .then((res) => {
          createdDiscountId = res.body.id;
          expect(res.body.code).toEqual('E2EADMIN');
        });
    });

    it('GET /discounts should list discounts', async () => {
      await request(httpServer)
        .get('/discounts')
        .set(adminAuth())
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body.some((d) => d.id === createdDiscountId)).toBeTruthy();
        });
    });

    it('GET /discounts/:id should return a discount', async () => {
      await request(httpServer)
        .get(`/discounts/${createdDiscountId}`)
        .set(adminAuth())
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(res.body.id).toEqual(createdDiscountId);
        });
    });

    it('PATCH /discounts/:id should update a discount', async () => {
      await request(httpServer)
        .patch(`/discounts/${createdDiscountId}`)
        .set(adminAuth())
        .send({ amount: 15, isActive: false })
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(res.body.amount).toEqual(15);
          expect(res.body.isActive).toEqual(false);
        });
    });

    it('DELETE /discounts/:id should remove a discount', async () => {
      await request(httpServer)
        .delete(`/discounts/${createdDiscountId}`)
        .set(adminAuth())
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('As Regular User', () => {
    it('POST /discounts should be forbidden', async () => {
      await request(httpServer)
        .post('/discounts')
        .set(userAuth())
        .send({
          code: 'SHOULDFAIL',
          type: DiscountType.FIXED,
          amount: 5,
          isActive: true,
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /discounts should be forbidden', async () => {
      await request(httpServer)
        .get('/discounts')
        .set(userAuth())
        .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /discounts/:id should be forbidden', async () => {
      await request(httpServer)
        .get(`/discounts/${createdDiscountId}`)
        .set(userAuth())
        .expect(HttpStatus.FORBIDDEN);
    });

    it('PATCH /discounts/:id should be forbidden', async () => {
      await request(httpServer)
        .patch(`/discounts/${createdDiscountId}`)
        .set(userAuth())
        .send({ amount: 1 })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /discounts/:id should be forbidden', async () => {
      await request(httpServer)
        .delete(`/discounts/${createdDiscountId}`)
        .set(userAuth())
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
