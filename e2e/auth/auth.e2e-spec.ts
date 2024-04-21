import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module'; // Update this path to the actual path of your AppModule
import { AuthService } from '../../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const authService = {
      register: () => ({
        id: 1,
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      }),
      login: () => ({
        accessToken: 'mock-token',
      }),
      validateUser: () => ({
        id: 1,
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Include the main module that includes AuthController
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
    };
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(newUser)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          data: {
            id: 1,
            email: 'test@example.com',
            password: 'password123',
            role: 'user',
          },
          statusCode: 201,
        });
      });
  });

  it('/auth/login (POST)', async () => {
    const loginUser = {
      email: 'test@example.com',
      password: 'password123',
    };
    // Assuming you have a service to mock successful login
    // and the response has a property 'access_token'
    await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.data.accessToken).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
