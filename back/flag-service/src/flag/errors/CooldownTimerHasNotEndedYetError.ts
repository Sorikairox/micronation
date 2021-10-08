import { HttpException, HttpStatus } from "@nestjs/common";

export class CooldownTimerHasNotEndedYetError extends HttpException {
  constructor(remainingTimeInMilliseconds: number) {
    super({
      message: 'Please retry later.',
      retryAfter: remainingTimeInMilliseconds,
    }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
