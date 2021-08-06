import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { v4 } from 'uuid';
import { JwtExceptionFilter } from '../src/authentication/filters/JwtExceptionFilter';
import { FlagModule } from '../src/flag/FlagModule';
import { UserService } from '../src/user/UserService';
import { registerAndLogin } from './util/registerAndLogin';


describe('Flag (e2e)', () => {
  let app: INestApplication;
  let createdPixel;
  let modifiedPixel;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FlagModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new JwtExceptionFilter());
    await app.init();
    const dbService = app.get<DatabaseClientService>('DATABASE_CLIENT');
    await dbService.getDb().collection('users').deleteMany({});
    await dbService.getDb().collection('pixel-events').deleteMany({});
    jwt = await registerAndLogin(app, v4() + '@example.com', 'password123', v4());
  });

  afterAll(async () => {
    await app.close();
  });

  it('/pixel (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/pixel')
      .set('authorization', jwt)
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
      .set('authorization', jwt)
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
      .set('authorization', jwt);
    const firstPixel = res.body[0];

    expect(res.status).toEqual(200);

    expect(firstPixel.author).toEqual('niceownerid');
    expect(firstPixel.hexColor).toEqual('#DDDDDD');
    expect(firstPixel.createdAt).toEqual(createdPixel.createdAt);
    expect(firstPixel.lastUpdate).toEqual(modifiedPixel.createdAt);
  });


  describe('User', () => {
    let userService: UserService;

    beforeAll(() => {
        userService = app.get(UserService);
    });

    describe('POST /user/register', () => {
      it('success', async () => {
        const res = await request(app.getHttpServer())
            .post('/user/register')
            .send({
              email: 'user@example.com',
              password: 'password123',
              passwordConfirmation: 'password123',
              nickname: 'jane',
            });

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({ success: true });
      });

      describe('failure', () => {
        function testBadValues(name: string, email: string, password: string, passwordConfirmation: string, nickname: string) {
          describe(name, () => {
            let registerSpy;
            let res;
            beforeAll(async () => {
              registerSpy = jest.spyOn(userService, 'register');
              res = await request(app.getHttpServer())
                  .post('/user/register')
                  .send({
                    email: email,
                    password: password,
                    passwordConfirmation: passwordConfirmation,
                    nickname: nickname
                  });
            });
            it('responds with a Bad Request HTTP Error', async () => {
              expect(res.status).toBe(400);
            });
            it('doesn\'t call register from service', () => {
              expect(registerSpy).not.toBeCalled();
            });
          });
        }

        describe('email', () => {
          testBadValues('invalid email', 'not a valid email address', 'password123', 'password123', 'jane');
        });

        describe('password', () => {
          testBadValues('too short', 'user@example.com', 'abc12', 'abc12', 'jane');
          testBadValues('no number', 'user@example.com', 'password', 'password', 'jane');
          testBadValues('no letter', 'user@example.com', '1239009384657493', '1239009384657493', 'jane');
        });

        describe('passwordConfirmation', () => {
          testBadValues('incorrect', 'user@example.com', 'password123', 'password123 incorrect', 'jane');
        });

        describe('nickname', () => {
          testBadValues('too short', 'user@example.com', 'password123', 'password123', 'ab');
          testBadValues('has spaces', 'user@example.com', 'password123', 'password123', ' has spaces ');
          for (const invalidCharacter of ['!', '@', '+', '~', '$', '#', '%', '^', '&', '*']) {
            testBadValues(`invalid character ${invalidCharacter}`, 'user@example.com', 'password123', 'password123', `nick${invalidCharacter}name`);
          }
        });
      });
    });
    describe('POST /user/login', () => {
      it('success', async () => {
        const res = await request(app.getHttpServer())
            .post('/user/login')
            .send({
              email: 'user@example.com',
              password: 'password123',
            });

        expect(res.status).toBe(201);
      });

      describe('failure', function () {
        function testBadValues(name: string, email: string, password: string) {
          describe(name, () => {
            let loginSpy;
            let res;
            beforeAll(async () => {
              loginSpy = jest.spyOn(userService, 'login');
              res = await request(app.getHttpServer())
                  .post('/user/login')
                  .send({
                    email: email,
                    password: password,
                  });
            });
            it('responds with a Bad Request HTTP Error', async () => {
              expect(res.status).toBe(400);
            });
            it('doesn\'t call login from service', () => {
              expect(loginSpy).not.toBeCalled();
            });
          });
        }

        describe('email', () => {
          testBadValues('invalid email', 'not a valid email address', 'password123');
        });

        describe('password', () => {
          testBadValues('too short', 'user@example.com', 'abc12');
          testBadValues('no number', 'user@example.com', 'password');
          testBadValues('no letter', 'user@example.com', '1239009384657493');
        });
      });
    });
    describe('PUT /user/change-password', () => {
      let jwt: string;

      beforeAll(async () => {
        jwt = await registerAndLogin(app, v4() + '@example.com', 'password123', v4());
      });

      it('success', async () => {
        const res = await request(app.getHttpServer())
            .put('/user/change-password')
            .set('authorization', jwt)
            .send({
              currentPassword: 'password123',
              newPassword: 'newPassword999',
              newPasswordConfirmation: 'newPassword999',
            });

        expect(res.status).toBe(200);
      });

      describe('failure', () => {
        beforeAll(async () => {
          jwt = await registerAndLogin(app, v4() + '@example.com', 'password123', v4());
        });

        function testBadValues(name: string, currentPassword: string, newPassword: string, newPasswordConfirmation: string) {
          describe(name, () => {
            let changePasswordSpy;
            let res;
            beforeAll(async () => {
              changePasswordSpy = jest.spyOn(userService, 'changePassword');
              res = await request(app.getHttpServer())
                  .put('/user/change-password')
                  .set('authorization', jwt)
                  .send({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    newPasswordConfirmation: newPasswordConfirmation,
                  });
            });
            it('responds with a Bad Request HTTP Error', async () => {
              expect(res.status).toBe(400);
            });
            it('doesn\'t call register from service', () => {
              expect(changePasswordSpy).not.toBeCalled();
            });
          });
        }

        describe('currentPassword', () => {
          testBadValues('too short', 'abc12', 'password123', 'password123');
          testBadValues('no number', 'password', 'password123', 'password123');
          testBadValues('no letter', '1239009384657493', 'password123', 'password123');
        });

        describe('newPassword', () => {
          testBadValues('too short', 'password123', 'abc12', 'abc12');
          testBadValues('no number', 'password123', 'password', 'password');
          testBadValues('no letter', 'password123', '1239009384657493', '1239009384657493');
        });

        describe('newPasswordConfirmation', () => {
          testBadValues('incorrect', 'password123', 'password123', 'password123 incorrect');
        });
      });
    });
    describe('PUT /user/change-nickname', () => {
      let jwt: string;
      beforeAll(async () => {
        jwt = await registerAndLogin(app, v4() + '@example.com', 'password123', v4());
      });

      it('success', async () => {
        const res = await request(app.getHttpServer())
            .put('/user/change-nickname')
            .set('authorization', jwt)
            .send({
              jwt: jwt,
              password: 'password123',
              newNickname: 'jack76',
            });

        expect(res.status).toBe(200);
      });

      describe('failure', function () {
        beforeAll(async () => {
          jwt = await registerAndLogin(app, v4() + '@example.com', 'password123', v4());
        });

        describe('bad field values', () => {
          function testBadValues(name: string, password: string, newNickname: string) {
            describe(name, () => {
              let changeNicknameSpy;
              let res;
              beforeAll(async () => {
                changeNicknameSpy = jest.spyOn(userService, 'changeNickname');
                res = await request(app.getHttpServer())
                    .put('/user/change-nickname')
                    .set('authorization', jwt)
                    .send({
                      password: password,
                      newNickname: newNickname,
                    });
              });
              it('responds with a Bad Request HTTP Error', async () => {
                expect(res.status).toBe(400);
              });
              it('doesn\'t call changeNickname from service', () => {
                expect(changeNicknameSpy).not.toBeCalled();
              });
            });
          }

          describe('password', () => {
            testBadValues('too short', 'abc12', 'nickname');
            testBadValues('no number', 'password', 'nickname');
            testBadValues('no letter', '1239009384657493', 'nickname');
          });

          describe('newNickname', () => {
            testBadValues('too short', 'password123', 'ab');
            testBadValues('has spaces', 'password123', ' has spaces ');
            for (const invalidCharacter of ['!', '@', '+', '~', '$', '#', '%', '^', '&', '*']) {
              testBadValues(`invalid character ${invalidCharacter}`, 'password123', `nick${invalidCharacter}name`);
            }
          });
        });
      });
    });
  });


});
