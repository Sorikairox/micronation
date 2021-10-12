import { BadRequestException } from "@nestjs/common";

export class UserHasNoPixel extends BadRequestException {
  constructor() {
    super('User has no pixel.');
  }
}
