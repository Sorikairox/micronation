import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export function getUserIdFromCtx(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
}

export const UserIdDecorator = createParamDecorator(getUserIdFromCtx);
