import { BadRequestException } from "@nestjs/common";

export class IncorrectPasswordError extends BadRequestException {
  constructor(field: string) {
    super(field, 'Incorrect password.');
  }
}
