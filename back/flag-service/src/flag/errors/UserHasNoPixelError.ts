import { BadRequestException } from "@nestjs/common";

export class UserHasNoPixelError extends BadRequestException {
  constructor() {
    super('User has no pixel.');
  }
}
