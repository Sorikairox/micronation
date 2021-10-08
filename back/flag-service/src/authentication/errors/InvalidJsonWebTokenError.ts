import { ForbiddenException } from "@nestjs/common";

export class InvalidJsonWebTokenError extends ForbiddenException {
  constructor() {
    super('header: Authorization', 'Invalid JWT.');
  }
}
