import { BadRequestException } from "@nestjs/common";

export class PixelDoesNotExistError extends BadRequestException {
  constructor() {
    super('Pixel does not exist.');
  }
}
