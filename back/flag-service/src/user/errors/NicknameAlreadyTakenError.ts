import { BadRequestException } from "@nestjs/common";

export class NicknameAlreadyTakenError extends BadRequestException {
  constructor(field: string, nickname: string) {
    super(field, `Nickname ${nickname} already taken.`);
  }
}
