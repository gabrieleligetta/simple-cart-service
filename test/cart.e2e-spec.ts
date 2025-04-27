import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../src/user/user.repository';
import { ProductRepository } from '../src/product/product.repository';
import { DiscountRepository } from '../src/discount/discount.repository';
import { DiscountType } from '../src/discount/discount.entity';

let productId: number;
let userToken: string;

const createTestUser = async (userRepo: UserRepository) => {
  return await userRepo.create({
    email: 'test-cart@example.com',
    password: 'hashedpassword',
  });
};

const createTestProduct = async (productRepo: ProductRepository) => {
  return await productRepo.create({
    name: 'Test Product',
    description: 'E2E Test Product',
    price: 10,
    stock: 50,
  });
};

const createTestDiscount = async (
  discountRepo: DiscountRepository,
  type: DiscountType,
  code: string,
  amount: number,
) => {
  return await discountRepo.create({
    code,
    type,
    amount,
    isActive: true,
  });
};

describe('CartController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    const userRepo = moduleFixture.get<UserRepository>(UserRepository);
    const productRepo = moduleFixture.get<ProductRepository>(ProductRepository);
    const discountRepo =
      moduleFixture.get<DiscountRepository>(DiscountRepository);

    // Create and authenticate user
    const testUser = await createTestUser(userRepo);
    userToken = jwtService.sign({ id: testUser.id, email: testUser.email });

    // Create product
    const testProduct = await createTestProduct(productRepo);
    productId = testProduct.id;

    // Create discounts
    await createTestDiscount(
      discountRepo,
      DiscountType.PERCENTAGE,
      'PCT10',
      10,
    );
    await createTestDiscount(discountRepo, DiscountType.FIXED, 'FIXED20', 20);
  });

  afterAll(async () => {
    await app.close();
  });

  const authHeader = () => ({ Authorization: `Bearer ${userToken}` });

  // --- public /unauthenticated access tests ---
  it('GET /cart without token should be 401', () => {
    return request(httpServer).get('/cart').expect(HttpStatus.UNAUTHORIZED);
  });
  it('POST /cart/add without token should be 401', () => {
    return request(httpServer)
      .post('/cart/add')
      .send({ productId, quantity: 1 })
      .expect(HttpStatus.UNAUTHORIZED);
  });
  it('POST /cart/add/discount without token should be 401', () => {
    return request(httpServer)
      .post('/cart/add/discount')
      .send({ code: 'PCT10' })
      .expect(HttpStatus.UNAUTHORIZED);
  });
  it('POST /cart/remove without token should be 401', () => {
    return request(httpServer)
      .post('/cart/remove')
      .send({ productId })
      .expect(HttpStatus.UNAUTHORIZED);
  });
  it('POST /cart/remove/discount without token should be 401', () => {
    return request(httpServer)
      .post('/cart/remove/discount')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  // --- authenticated behavior ---
  it('should create a fresh cart and have zero totals', async () => {
    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.items).toEqual([]);
        expect(res.body.subtotal).toBeCloseTo(0);
        expect(res.body.discount_amount).toBeCloseTo(0);
        expect(res.body.total).toBeCloseTo(0);
      });
  });

  it('should add items and apply percentage discount correctly', async () => {
    await request(httpServer)
      .post('/cart/add')
      .set(authHeader())
      .send({ productId, quantity: 2 })
      .expect(HttpStatus.OK);

    await request(httpServer)
      .post('/cart/add/discount')
      .set(authHeader())
      .send({ code: 'PCT10' })
      .expect(HttpStatus.OK);

    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        const { subtotal, discount_amount, total } = res.body;
        expect(subtotal).toBeCloseTo(20);
        expect(discount_amount).toBeCloseTo(20 * 0.1);
        expect(total).toBeCloseTo(20 - 2);
      });
  });

  it('should not apply an invalid discount', async () => {
    await request(httpServer)
      .post('/cart/add/discount')
      .set(authHeader())
      .send({ code: 'UNKNOWN' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should remove percentage discount', async () => {
    await request(httpServer)
      .post('/cart/remove/discount')
      .set(authHeader())
      .expect(HttpStatus.OK);

    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.discount_amount).toBeCloseTo(0);
        expect(res.body.total).toBeCloseTo(res.body.subtotal);
      });
  });

  it('should apply fixed discount and not go negative', async () => {
    await request(httpServer)
      .post('/cart/remove')
      .set(authHeader())
      .send({ productId })
      .expect(HttpStatus.OK);

    await request(httpServer)
      .post('/cart/add')
      .set(authHeader())
      .send({ productId, quantity: 1 })
      .expect(HttpStatus.OK);

    await request(httpServer)
      .post('/cart/add/discount')
      .set(authHeader())
      .send({ code: 'FIXED20' })
      .expect(HttpStatus.OK);

    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        const { subtotal, discount_amount, total } = res.body;
        expect(subtotal).toBeCloseTo(10);
        expect(discount_amount).toBeCloseTo(10);
        expect(total).toBeCloseTo(0);
      });
  });

  it('should error when removing non-existent discount', async () => {
    await request(httpServer)
      .post('/cart/remove/discount')
      .set(authHeader())
      .expect(HttpStatus.OK);

    await request(httpServer)
      .post('/cart/remove/discount')
      .set(authHeader())
      .expect(HttpStatus.NOT_FOUND);
  });
});
