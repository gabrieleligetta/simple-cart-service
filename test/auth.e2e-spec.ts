// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // or your root module
// If needed, import or mock database connection, etc.

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  // We'll store the JWT token once we get it from /auth/login
  let jwtToken: string;

  beforeAll(async () => {
    // Create a testing module using your root AppModule (or a test module)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create Nest application for E2E testing
    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    // Close the app to release resources
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'mypassword123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('test@example.com');
      // The response may not have password, depending on your logic
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail to register if email already exists (409)', async () => {
      // Attempt registering the same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'anotherpass',
        })
        .expect(409);
    });

    // You could also test for missing fields, invalid email format, etc.
  });

  describe('POST /auth/login', () => {
    it('should login and return access_token (200)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'mypassword123',
        })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      jwtToken = res.body.access_token;
    });

    it('should fail to login with incorrect password (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail to login if user does not exist (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'whatever',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should retrieve the current user with valid token (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${jwtToken}`) // pass the token
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('test@example.com');
      // Confirm password is not present (depends on your AuthService logic)
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail with 401 if token is missing', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with 401 if token is invalid or expired', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalidTokenHere')
        .expect(401);
    });
  });
});
