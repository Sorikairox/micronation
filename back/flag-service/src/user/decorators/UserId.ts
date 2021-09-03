import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export function getUserIdFromCtx(data: any, ctx: ExecutionContext) {
  const request = ctx.switchToHttp().getRequest();
  return request.userId;
}

export const UserId = createParamDecorator(getUserIdFromCtx);
