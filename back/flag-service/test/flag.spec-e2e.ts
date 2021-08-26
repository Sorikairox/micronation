import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import * as DirectusModule from "@directus/sdk";
import { AuthToken, Directus } from "@directus/sdk";
import { bootstrap } from "../src/bootstrap";
import { AuthBackend } from "../src/user/AuthBackend";
import { registerAndLogin } from "./util/registerAndLogin";
import { v4 } from "uuid";
import { getAvailableAppPort } from "./util/getAvailableAppPort";

jest.mock('@directus/sdk')

const VALID_DIRECTUS_TOKEN = 'valid token';

describe('Flag (e2e)', () => {
  let savedEnvAuthBackend: string;

  let app: INestApplication;
  let createdPixel;
  let modifiedPixel;
  let token: string;

  beforeAll(() => {
    savedEnvAuthBackend = process.env.AUTH_BACKEND;
  });

  afterAll(() => {
    process.env.AUTH_BACKEND = savedEnvAuthBackend;
  });

  for (const authBackend of Object.values(AuthBackend)) {
    describe(`Auth backend: ${authBackend}`, () => {
      beforeAll(async () => {
        process.env.AUTH_BACKEND = authBackend;
        app = await bootstrap(getAvailableAppPort());

        const dbService = app.get<DatabaseClientService>('DATABASE_CLIENT');
        const db = dbService.getDb();
        await db.collection('users').deleteMany({});
        await db.collection('pixel-events').deleteMany({});

        if (authBackend === AuthBackend.FOULOSCOPIE) {
          token = VALID_DIRECTUS_TOKEN;
          jest.spyOn(DirectusModule, 'Directus').mockImplementation(() => ({
            auth: {
              async static(token: AuthToken) {
                return token === VALID_DIRECTUS_TOKEN;
              }
            }
          } as Directus<any>));
        } else if (authBackend === AuthBackend.INTERNAL) {
          token = await registerAndLogin(app, v4() + '@example.com', 'password123', v4());
        }
      });

      afterAll(async () => {
        await app.close();
      });

      it('/pixel (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/pixel')
          .set('authorization', token)
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
          .set('authorization', token)
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
          .get('/flag')
          .set('authorization', token);
        const firstPixel = res.body[0];

        expect(res.status).toEqual(200);

        expect(firstPixel.author).toEqual('niceownerid');
        expect(firstPixel.hexColor).toEqual('#DDDDDD');
        expect(firstPixel.createdAt).toEqual(createdPixel.createdAt);
        expect(firstPixel.lastUpdate).toEqual(modifiedPixel.createdAt);
      });
    });
  }
});
