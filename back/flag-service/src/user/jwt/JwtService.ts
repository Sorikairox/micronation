import { Injectable } from "@nestjs/common";
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { v4 } from "uuid";
import { ExpiredJsonWebTokenError } from "../../authentication/errors/ExpiredJsonWebTokenError";
import { InvalidJsonWebTokenError } from "../../authentication/errors/InvalidJsonWebTokenError";

@Injectable()
export class JwtService {
  async onModuleInit(): Promise<void> {
    if (!this.secret || this.secret.length === 0 || this.secret === 'changeme') {
      throw new Error('JWT_SECRET environment variable is not configured!');
    }
  }

  public async sign<PayloadFormat extends PayloadFormatBaseType>(payload: ExtendedJwtPayload<PayloadFormat>, expiresIn: string): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      jwt.sign(payload, this.secret, {
        jwtid: v4(),
        expiresIn: expiresIn,
      }, (err, signedToken) => {
        if (err) return reject(err);

        resolve(signedToken);
      });
    });
  }

  public async verify<PayloadFormat extends PayloadFormatBaseType>(token: string): Promise<ExtendedJwtPayload<PayloadFormat>> {
    let payload: JwtPayload & PayloadFormat;
    try {
      payload = await new Promise<ExtendedJwtPayload<PayloadFormat>>((resolve, reject) => {
        jwt.verify(token, this.secret, (err, decodedPayload) => {
          if (err) return reject(err);

          resolve(decodedPayload as ExtendedJwtPayload<PayloadFormat>);
        });
      });
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new ExpiredJsonWebTokenError();
      } else if (e instanceof JsonWebTokenError) {
        throw new InvalidJsonWebTokenError();
      } else {
        throw e;
      }
    }
    return payload;
  }

  private get secret(): string {
    return process.env.JWT_SECRET;
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type PayloadFormatBaseType = string | object | Buffer;

export type ExtendedJwtPayload<T> = JwtPayload & T;
