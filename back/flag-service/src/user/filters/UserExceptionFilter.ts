import { BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { EmailAlreadyTakenError } from '../errors/EmailAlreadyTakenError';
import { EmailNotFoundError } from '../errors/EmailNotFoundError';
import { IncorrectPasswordError } from '../errors/IncorrectPasswordError';
import { NicknameAlreadyTakenError } from '../errors/NicknameAlreadyTakenError';
import { InvalidDirectusTokenError } from "../errors/InvalidDirectusTokenError";
import { MissingDirectusTokenError } from "../errors/MissingDirectusTokenError";

@Catch(EmailAlreadyTakenError, NicknameAlreadyTakenError, EmailNotFoundError, IncorrectPasswordError)
export class UserExceptionFilter implements ExceptionFilter {
  catch(e: Error) {
    if (e instanceof EmailAlreadyTakenError || e instanceof NicknameAlreadyTakenError ||
      e instanceof EmailNotFoundError || e instanceof IncorrectPasswordError
      || e instanceof InvalidDirectusTokenError || e instanceof MissingDirectusTokenError) {
      throw new BadRequestException(e);
    } else {
      throw e;
    }
  }
}
