import { BadRequestException } from "@nestjs/common";

export class MissingDirectusTokenError extends BadRequestException {
  constructor() {
    super('header: Authorization', 'Missing directus token.');
  }
}
