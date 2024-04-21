import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { CoreModule } from '../../src/core/core.module';

describe('Cats', () => {
  const catsService = {
    findAllPaginated: () => ({
      items: [{ id: 1, name: 'Fluffy', breed: 'Maine Coon', age: 2 }],
      hasNext: true,
      nextCursor: 1,
      total: 1,
    }),
    findById: (id: number) => ({
      id,
      name: 'Fluffy',
      breed: 'Maine Coon',
      age: 2,
    }),
  };

  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule, CoreModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer()).get('/cats').expect(200).expect({
      data: catsService.findAllPaginated(),
      statusCode: 200,
    });
  });

  it(`/GET:id cats by an id`, () => {
    return request(app.getHttpServer())
      .get('/cats/5')
      .expect(200)
      .expect({
        data: catsService.findById(5),
        statusCode: 200,
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
