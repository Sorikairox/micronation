import { BadRequestException } from '@nestjs/common';
import { EmailAlreadyTakenError } from '../../errors/EmailAlreadyTakenError';
import { EmailNotFoundError } from '../../errors/EmailNotFoundError';
import { IncorrectPasswordError } from '../../errors/IncorrectPasswordError';
import { NicknameAlreadyTakenError } from '../../errors/NicknameAlreadyTakenError';
import { UserIdNotFoundError } from '../../errors/UserIdNotFoundError';
import { UserExceptionFilter } from '../UserExceptionFilter';

describe('UserExceptionFilter', () => {
    const userExceptionFilter = new UserExceptionFilter();
    for (const exception of [
        EmailAlreadyTakenError,
        NicknameAlreadyTakenError,
        EmailNotFoundError,
        IncorrectPasswordError,
    ]) {
        it(`Should transform a ${exception} to a BadRequestException`, () => {
            expect(() => {
                userExceptionFilter.catch(new exception);
            }).toThrow(BadRequestException);
        });
    }

    it(`Should not transform any other error`, () => {
        const error = new UserIdNotFoundError();
        expect(() => {
            userExceptionFilter.catch(error);
        }).toThrow(error);
    });
});
