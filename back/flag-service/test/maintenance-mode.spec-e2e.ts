import { bootstrap } from "../src/bootstrap";
import request from "supertest";

describe('Maintenance mode', () => {
  let app;
  let savedEnvAuthBackend: string;

  beforeAll(async () => {
    savedEnvAuthBackend = process.env.AUTH_BACKEND;
    process.env.AUTH_BACKEND = 'fouloscopie';
    app = await bootstrap(0);
  });
  afterAll(async () => {
    await app.close();
    process.env.AUTH_BACKEND = savedEnvAuthBackend;
  });

  describe('Maintenance mode ON', () => {
    let previousMaintenanceMode;
    beforeAll(async () => {
      previousMaintenanceMode = process.env.MAINTENANCE_MODE;
      process.env.MAINTENANCE_MODE = 'true';
    });
    afterAll(async () => {
      process.env.MAINTENANCE_MODE = previousMaintenanceMode;
    });

    test('responds with 404 on /', async () => {
      const res = await request(app.getHttpServer())
        .get('/');

      expect(res.status).toEqual(404);
    });

    test('responds with 503 on /flag', async () => {
      const res = await request(app.getHttpServer())
        .get('/flag');

      expect(res.status).toEqual(503);
    });
  });

  describe('Maintenance mode OFF', () => {
    let previousMaintenanceMode;
    beforeAll(async () => {
      previousMaintenanceMode = process.env.MAINTENANCE_MODE;
      process.env.MAINTENANCE_MODE = 'false';
    });
    afterAll(async () => {
      process.env.MAINTENANCE_MODE = previousMaintenanceMode;
    });

    test('responds with 404 on /', async () => {
      const res = await request(app.getHttpServer())
        .get('/');

      expect(res.status).toEqual(404);
    });

    test('responds with 200 on /flag', async () => {
      const res = await request(app.getHttpServer())
        .get('/flag');

      expect(res.status).toEqual(200);
    });
  });
});
