import { AuthGuard } from '../AuthGuard';
import { Public } from "../../decorators/PublicDecorator";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { JwtService } from "../../jwt/JwtService";
import { config } from 'dotenv';

config();

describe('AuthGuard', () => {
  const reflector = new Reflector();
  const jwtService = new JwtService();
  const authGuard = new AuthGuard(reflector, jwtService);

  class Test {
    static defaultRoute() {
      //
    }

    @Public()
    static publicRoute() {
      //
    }
  }

  async function mockContext(
    handler: Function,
    authenticated: boolean,
  ): Promise<ExecutionContext> {
    const payload = {
      sub: '999', // user id
      userData: {
        id: 999,
        email: 'user@example.com',
        nickname: 'jane',
        createdAt: new Date(),
      },
    };
    const request: any = { headers: {} };
    if (!request.headers) request.headers = {};
    if (authenticated) request.headers.authorization = await jwtService.sign(payload, '15 days');
    return {
      getHandler(): Function {
        return handler;
      },
      switchToHttp(): HttpArgumentsHost {
        return {
          getRequest() {
            return request;
          }
        } as HttpArgumentsHost;
      }
    } as ExecutionContext;
  }

  function testJwtServiceUsage(handler: Function, shouldUse: boolean) {
    describe('verifies jwt using JwtService.verify()', () => {
      let verifySpy: any;
      beforeAll(async () => {
        verifySpy = jest.spyOn(jwtService, 'verify');
        if (shouldUse) {
          verifySpy = verifySpy.mockReturnValue(Promise.reject(new Error('Fake error')));
        } else {
          try {
            await authGuard.canActivate(await mockContext(handler, true));
          } catch (_) {
          }
        }
      });

      afterAll(() => {
        verifySpy.mockRestore();
      });

      if (shouldUse) {
        it('throws Fake error', async () => {
          await expect(authGuard.canActivate(await mockContext(handler, true)))
            .rejects.toThrow('Fake error');
        });
        it('calls JwtService.verify()', async () => {
          expect(verifySpy).toBeCalledTimes(1);
        });
      } else {
        it('doesn\'t call JwtService.verify()', async () => {
          expect(verifySpy).not.toBeCalled();
        });
      }
    });
  }

  function testRequestFieldsArePopulated(handler: Function, shouldPopulateFieldsWhenAuthenticated: boolean) {
    function doesNotPopulateFields(context: () => ExecutionContext) {
      it('clears jwtPayload field from request', async () => {
        const jwtPayload = context().switchToHttp().getRequest().jwtPayload;
        expect(jwtPayload).not.toBeDefined();
      });
      it('clears user field from request', async () => {
        const user = context().switchToHttp().getRequest().user;
        expect(user).not.toBeDefined();
      });
    }

    function populatesFields(context: () => ExecutionContext) {
      it('adds jwtPayload field to request', async () => {
        const jwtPayload = context().switchToHttp().getRequest().jwtPayload;
        expect(jwtPayload).toBeDefined();
        expect(jwtPayload).toHaveProperty('jti');
      });
      it('adds user field to request', async () => {
        const user = context().switchToHttp().getRequest().user;
        expect(user).toBeDefined();
        expect(user).toHaveProperty('id');
      });
    }

    describe('request fields population', () => {
      describe('not authenticated', () => {
        let context: ExecutionContext;

        beforeAll(async () => {
          context = await mockContext(handler, false);

          try {
            await authGuard.canActivate(context);
          } catch (_) {
          }
        });

        doesNotPopulateFields(() => context);
      });
      describe('authenticated', () => {
        let context: ExecutionContext;

        beforeAll(async () => {
          context = await mockContext(handler, true);

          try {
            await authGuard.canActivate(context);
          } catch (_) {
          }
        });

        if (shouldPopulateFieldsWhenAuthenticated) {
          populatesFields(() => context);
        } else {
          doesNotPopulateFields(() => context);
        }
      });
    });
  }

  describe('default (auth only)', () => {
    it('throws ForbiddenException when not authenticated', async () => {
      await expect(authGuard.canActivate(await mockContext(Test.defaultRoute, false)))
        .rejects.toThrow(ForbiddenException);
    });
    it('allows access when authenticated', async () => {
      await expect(authGuard.canActivate(await mockContext(Test.defaultRoute, true)))
        .resolves.toBe(true);
    });
    testJwtServiceUsage(Test.defaultRoute, true);
    testRequestFieldsArePopulated(Test.defaultRoute, true);
  });

  describe('public', () => {
    it('allows access when not authenticated', async () => {
      await expect(authGuard.canActivate(await mockContext(Test.publicRoute, false)))
        .resolves.toBe(true);
    });
    it('allows access when authenticated', async () => {
      await expect(authGuard.canActivate(await mockContext(Test.publicRoute, true)))
        .resolves.toBe(true);
    });
    testJwtServiceUsage(Test.publicRoute, true);
    testRequestFieldsArePopulated(Test.publicRoute, true);
  });
});
