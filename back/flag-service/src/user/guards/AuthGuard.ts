import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from "@nestjs/core";
import { JwtPayload } from 'jsonwebtoken';
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
      const payload = await this.jwtService.verify(jwt);

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
