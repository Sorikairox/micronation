import { InternalServerErrorException } from "@nestjs/common";
import { ObjectID } from "mongodb";

export class UserIdNotFoundError extends InternalServerErrorException {
  constructor(userId: string | ObjectID) {
    super(`No user found for id=${userId}`);
  }
}
