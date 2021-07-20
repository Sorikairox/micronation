import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
