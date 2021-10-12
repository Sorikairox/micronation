import { BadRequestException } from "@nestjs/common";

export class EmailNotFoundError extends BadRequestException {
  constructor(field: string, email: string) {
    super(field, `Email ${email} not found in database.`);
  }
}
