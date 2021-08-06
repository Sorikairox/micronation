import {
    Catch,
    ExceptionFilter,
    ForbiddenException,
    UnauthorizedException
} from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch(JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
    catch(e: Error) {
        if (e instanceof TokenExpiredError) {
            throw new UnauthorizedException(e);
        } else if (e instanceof JsonWebTokenError) {
            throw new ForbiddenException(e);
        }
    }
}
