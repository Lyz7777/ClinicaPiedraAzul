// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('API Funcionando!');
  });

  it('/citas/horas-disponibles (GET) - debe validar parámetros', () => {
    return request(app.getHttpServer())
      .get('/citas/horas-disponibles')
      .expect(400);
  });

  it('/medicos (GET) - debe retornar array', () => {
    return request(app.getHttpServer())
      .get('/medicos')
      .expect(200)
      .expect((res: any) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});