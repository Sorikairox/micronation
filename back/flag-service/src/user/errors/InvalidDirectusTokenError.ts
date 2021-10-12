import { BadRequestException } from "@nestjs/common";

export class InvalidDirectusTokenError extends BadRequestException {
  constructor() {
    super('header: Authorization', 'Invalid directus token.');
  }
}
