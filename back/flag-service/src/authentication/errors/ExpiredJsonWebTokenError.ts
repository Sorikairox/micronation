import { UnauthorizedException } from "@nestjs/common";

export class ExpiredJsonWebTokenError extends UnauthorizedException {
  constructor() {
    super('header: Authorization', 'Expired JWT.');
  }
}
