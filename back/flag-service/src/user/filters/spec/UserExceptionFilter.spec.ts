import { BadRequestException } from '@nestjs/common';
import { EmailAlreadyTakenError } from '../../errors/EmailAlreadyTakenError';
import { EmailNotFoundError } from '../../errors/EmailNotFoundError';
import { IncorrectPasswordError } from '../../errors/IncorrectPasswordError';
import { NicknameAlreadyTakenError } from '../../errors/NicknameAlreadyTakenError';
import { UserIdNotFoundError } from '../../errors/UserIdNotFoundError';
import { UserExceptionFilter } from '../UserExceptionFilter';
import { InvalidDirectusTokenError } from "../../errors/InvalidDirectusTokenError";
import { MissingDirectusTokenError } from "../../errors/MissingDirectusTokenError";

describe('UserExceptionFilter', () => {
  const userExceptionFilter = new UserExceptionFilter();
  for (const exception of [
    EmailAlreadyTakenError,
    NicknameAlreadyTakenError,
    EmailNotFoundError,
    IncorrectPasswordError,
    InvalidDirectusTokenError,
    MissingDirectusTokenError,
  ]) {
    it(`transforms a ${exception} to a BadRequestException`, () => {
      expect(() => {
        userExceptionFilter.catch(new exception);
      }).toThrow(BadRequestException);
    });
  }

  it(`doesn't transform any other error`, () => {
    const error = new UserIdNotFoundError();
    expect(() => {
      userExceptionFilter.catch(error);
    }).toThrow(error);
  });
});
