import { BadRequestException } from "@nestjs/common";

export class UserAlreadyOwnsAPixelError extends BadRequestException {
  constructor() {
    super('Current user already owns a pixel.');
  }
}
