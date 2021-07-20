import { AuthGuard } from '../AuthGuard';
import { Public } from "../../decorators/PublicDecorator";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { v4 } from 'uuid';
import jwt from "jsonwebtoken";
import { InvalidJwtError } from "../../errors/InvalidJwtError";
import { ExpiredJwtError } from "../../errors/ExpiredJwtError";

describe('AuthGuard', () => {
  const reflector = new Reflector();
  const authGuard = new AuthGuard(reflector);

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
            let signedJwt = undefined;
            if (authenticated) signedJwt = jwt.sign(jwtPayload, jwtSecret);
            return { jwt: signedJwt };
          }
        } as HttpArgumentsHost;
      }
    } as ExecutionContext;
  }

  function testInvalidJwts(handler: Function) {
    describe('invalid jwts', () => {
      it('throws an InvalidJwtError on jwts signed with a different key', async () => {
        await expect(authGuard.canActivate(mockContext(handler, true, defaultJwtPayload, 'bad key')))
          .rejects.toThrow(InvalidJwtError);
      });
    });

    describe('expired jwts', () => {
      for (const field of Object.keys(defaultJwtPayload)) {
        it('throws an ExpiredJwtError on missing ' + field + ' field', async () => {
          const payload = { ...defaultJwtPayload };
          delete payload[field];
          await expect(authGuard.canActivate(mockContext(handler, true, payload)))
            .rejects.toThrow(ExpiredJwtError);
        });
      }

      // User data
      for (const field of Object.keys(defaultJwtPayload.userData)) {
        const payload = { ...defaultJwtPayload };
        it('throws an ExpiredJwtError on missing userData.' + field + ' field', async () => {
          const userData = { ...defaultJwtPayload.userData };
          delete userData[field];
          payload.userData = userData;
          await expect(authGuard.canActivate(mockContext(handler, true, payload)))
            .rejects.toThrow(ExpiredJwtError);
        });
      }
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
    testInvalidJwts(Test.defaultRoute);
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
    testInvalidJwts(Test.publicRoute);
  });

  describe('exclusive public (with redirection)', () => {
    it('throws an UnauthorizedException when not authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.publicRouteWithRedirection, false)))
        .resolves.toBe(true);
    });
    it('throws an UnauthorizedException when authenticated', async () => {
      await expect(authGuard.canActivate(mockContext(Test.publicRouteWithRedirection, true)))
        .rejects.toThrow(UnauthorizedException);
    });
    testInvalidJwts(Test.publicRouteWithRedirection);
  });
});
