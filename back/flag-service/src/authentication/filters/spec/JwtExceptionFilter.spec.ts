import {ForbiddenException, UnauthorizedException} from "@nestjs/common";
import {JwtExceptionFilter} from "../JwtExceptionFilter";
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";

describe('JwtExceptionFilter', () => {
    const jwtExceptionFilter = new JwtExceptionFilter();

    it(`transforms a TokenExpiredError to a UnauthorizedException`, () => {
        expect(() => {
            jwtExceptionFilter.catch(new TokenExpiredError('', new Date()));
        }).toThrow(UnauthorizedException);
    });
    it(`transforms a JsonWebTokenError to a ForbiddenException`, () => {
        expect(() => {
            jwtExceptionFilter.catch(new JsonWebTokenError(''));
        }).toThrow(ForbiddenException);
    });

    it(`doesn't transform any other error`, () => {
        const error = new Error();
        expect(() => {
            jwtExceptionFilter.catch(error);
        }).toThrow(error);
    });
});