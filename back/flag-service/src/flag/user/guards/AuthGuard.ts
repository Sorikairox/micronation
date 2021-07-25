import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from "@nestjs/core";
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { JwtService } from "../jwt/JwtService";
import { User } from "../User";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const jwt = request.headers.authorization;
    const publicMetadata = this.reflector.get('public', context.getHandler());

    if (jwt) {
      if (publicMetadata && publicMetadata.redirect) {
        throw new UnauthorizedException();
      }

      let payload: JwtPayload;
      try {
        payload = await this.jwtService.verify(jwt);
      } catch (e) {
        if (e instanceof JsonWebTokenError) {
          throw new ForbiddenException(e);
        }

        throw e;
      }

      request.jwtPayload = payload;
      request.user = payload.userData;
      return true;
    } else if (publicMetadata) {
      return true;
    }

    throw new ForbiddenException();
  }
}

declare module "@nestjs/common" {
  interface Request {
    jwtPayload: JwtPayload;
    user: User;
  }
}
