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

  it('should create a fresh cart and have zero totals', async () => {
    // Fetch empty cart
    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.items).toEqual([]);
        expect(res.body.subtotal).toBeCloseTo(0);
        expect(res.body.discount).toBeCloseTo(0);
        expect(res.body.total).toBeCloseTo(0);
      });
  });

  it('should add items and apply percentage discount correctly', async () => {
    // Add 2 units → subtotal = 20
    await request(httpServer)
      .post('/cart/add')
      .set(authHeader())
      .send({ productId, quantity: 2 })
      .expect(HttpStatus.OK);

    // Apply percentage discount
    await request(httpServer)
      .post('/cart/add/discount')
      .set(authHeader())
      .send({ code: 'PCT10' })
      .expect(HttpStatus.OK);

    // Retrieve cart and assert
    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        const { subtotal, discount, total } = res.body;
        expect(subtotal).toBeCloseTo(20);
        expect(discount).toBeCloseTo(20 * 0.1);
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
    // Remove discount
    await request(httpServer)
      .post('/cart/remove/discount')
      .set(authHeader())
      .expect(HttpStatus.OK);

    // Cart returns to no-discount values
    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.discount).toBeCloseTo(0);
        expect(res.body.total).toBeCloseTo(res.body.subtotal);
      });
  });

  it('should apply fixed discount and not go negative', async () => {
    // Clear cart items
    await request(httpServer)
      .post('/cart/remove')
      .set(authHeader())
      .send({ productId })
      .expect(HttpStatus.OK);
    // Add 1 unit → subtotal = 10
    await request(httpServer)
      .post('/cart/add')
      .set(authHeader())
      .send({ productId, quantity: 1 })
      .expect(HttpStatus.OK);

    // Apply fixed discount
    await request(httpServer)
      .post('/cart/add/discount')
      .set(authHeader())
      .send({ code: 'FIXED20' })
      .expect(HttpStatus.OK);

    // Assert fixed cap behavior
    await request(httpServer)
      .get('/cart')
      .set(authHeader())
      .expect(HttpStatus.OK)
      .then((res) => {
        const { subtotal, discount, total } = res.body;
        expect(subtotal).toBeCloseTo(10);
        expect(discount).toBeCloseTo(10);
        expect(total).toBeCloseTo(0);
      });
  });

  it('should error when removing non-existent discount', async () => {
    // Ensure no discount present

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
