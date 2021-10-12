import { BadRequestException } from "@nestjs/common";

export class EmailAlreadyTakenError extends BadRequestException {
  constructor(field: string, email: string) {
    super(field, `Email address ${email} is already taken.`);
  }
}
