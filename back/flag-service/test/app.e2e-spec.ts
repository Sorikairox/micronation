import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FlagModule } from '../src/module';
import { DatabaseClientService } from 'library/database/client/service';

describe('Flag (e2e)', () => {
  let app: INestApplication;
  let createdPixel;
  let modifiedPixel;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FlagModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const dbService = app.get<DatabaseClientService>('DATABASE_CLIENT');
    await dbService.getDb().collection('pixel-events').deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  })

  it('/pixel (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/pixel')
      .send({
        ownerId: 'niceownerid',
        hexColor: '#FFADAD'
      });
    expect(res.status).toEqual(201);
    createdPixel = res.body;
  });

  it('/pixel (PUT)', async () => {
    const res = await request(app.getHttpServer())
      .put('/pixel')
      .send({
        pixelId: createdPixel.entityId,
        ownerId: 'niceownerid',
        hexColor: '#DDDDDD',
      });
    expect(res.status).toEqual(200);
    modifiedPixel = res.body;
  });

  it('/flag (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/flag');
    const firstPixel = res.body[0];

    expect(res.status).toEqual(200);

    expect(firstPixel.author).toEqual('niceownerid');
    expect(firstPixel.hexColor).toEqual('#DDDDDD');
    expect(firstPixel.createdAt).toEqual(createdPixel.createdAt);
    expect(firstPixel.lastUpdate).toEqual(modifiedPixel.createdAt);
  });
});
