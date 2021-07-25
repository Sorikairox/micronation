import { AuthGuard } from '../AuthGuard';
import { Public } from "../../decorators/PublicDecorator";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { v4 } from 'uuid';
import { JwtService } from "../../jwt/JwtService";

describe('AuthGuard', () => {
  const reflector = new Reflector();
  const authGuard = new AuthGuard(reflector);
  const jwtService = new JwtService();

  class Test {
    static defaultRoute() {
    }

    @Public()
    static publicRoute() {
    }

    @Public('/target')
    static publicRouteWithRedirection() {
    }
  }

  let defaultJwtPayload = {
    jti: v4(),
    iat: Date.now(),
    exp: Date.now() + 10 * 24 * 3600 * 1000, // now + 10 days
    sub: '999', // user id
    userData: {
      id: 999,
      email: 'user@example.com',
      nickname: 'jane',
    },
  };

  function mockContext(
    handler: Function,
    authenticated: boolean,
    jwtPayload = defaultJwtPayload,
    jwtSecret = process.env.JWT_SECRET,
  ): any {
    return {
      getHandler(): Function {
        return handler;
      },
      switchToHttp(): HttpArgumentsHost {
        return {
          getRequest() {
            return authenticated ?
              { jwt: jwtService.sign(jwtPayload, jwtSecret) } :
              {};
          }
        } as HttpArgumentsHost;
      }
    } as ExecutionContext;
  }

  function testJwtServiceUsage(handler: Function) {
    describe('verifies jwt using JwtService.verify()', () => {
      let verifySpy: any;
      beforeAll(() => {
        verifySpy = jest.spyOn(jwtService, 'verify')
          .mockReturnValue(Promise.reject('Fake error'));
      });

      it('calls JwtService.verify()', async () => {
        expect(verifySpy).toBeCalledTimes(1);
      });
      it('throws Fake error', async () => {
        await expect(authGuard.canActivate(mockContext(handler, true)))
          .rejects.toThrow('Fake error');
      });
    });
  }

  describe('default (auth only)', () => {
    it('throws ForbiddenException when not authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.defaultRoute, false)))
        .rejects.toThrow(ForbiddenException);
    });
    it('allows access when authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.defaultRoute, true)))
        .resolves.toBe(true);
    });
    testJwtServiceUsage(Test.defaultRoute);
  });

  describe('non-exclusive public', () => {
    it('allow access when not authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.publicRoute, false)))
        .resolves.toBe(true);
    });
    it('allows access when authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.publicRoute, true)))
        .resolves.toBe(true);
    });
    testJwtServiceUsage(Test.publicRoute);
  });

  describe('exclusive public (with redirection)', () => {
    it('allow access when not authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.publicRouteWithRedirection, false)))
        .resolves.toBe(true);
    });
    it('throws an UnauthorizedException when authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.publicRouteWithRedirection, true)))
        .rejects.toThrow(UnauthorizedException);
    });
    testJwtServiceUsage(Test.publicRouteWithRedirection);
  });
});
