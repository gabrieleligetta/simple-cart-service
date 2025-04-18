import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../src/user/user.repository';
import { DiscountType } from '../src/discount/discount.entity';

describe('DiscountController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let jwtService: JwtService;
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
    const testUser = await userRepo.create({
      email: 'discount-test@example.com',
      password: 'hashedpassword', // ensure to hash properly
    });
    userToken = jwtService.sign({ id: testUser.id, email: testUser.email });
  });

  afterAll(async () => {
    await app.close();
  });

  const authHeader = () => ({ Authorization: `Bearer ${userToken}` });

  it('should create a discount', async () => {
    await request(httpServer)
      .post('/discounts')
      .set(authHeader())
      .send({
        code: 'E2EDISCOUNT',
        type: DiscountType.PERCENTAGE,
        amount: 20,
        isActive: true,
      })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        createdDiscountId = res.body.id;
        expect(res.body.code).toEqual('E2EDISCOUNT');
      });
  });

  it('should list discounts', async () => {
    await request(httpServer)
      .get('/discounts')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.some((d) => d.id === createdDiscountId)).toBeTruthy();
      });
  });

  it('should get a discount by id', async () => {
    await request(httpServer)
      .get(`/discounts/${createdDiscountId}`)
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.id).toEqual(createdDiscountId);
      });
  });

  it('should update a discount', async () => {
    await request(httpServer)
      .put(`/discounts/${createdDiscountId}`)
      .set(authHeader())
      .send({ amount: 15, isActive: false })
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.amount).toEqual(15);
        expect(res.body.isActive).toEqual(false);
      });
  });

  it('should remove a discount', async () => {
    await request(httpServer)
      .delete(`/discounts/${createdDiscountId}`)
      .set(authHeader())
      .expect(HttpStatus.NO_CONTENT);
  });
});
