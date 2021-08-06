import { Injectable } from "@nestjs/common";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 } from "uuid";

@Injectable()
export class JwtService {
  async onModuleInit(): Promise<void> {
    if (!this.secret || this.secret.length === 0 || this.secret === 'changeme') {
      throw new Error('JWT_SECRET environment variable is not configured!');
    }
  }

  public async sign(payload: any, expiresIn: string): Promise<string> {
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

  public async verify(token: string): Promise<JwtPayload> {
    return await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(token, this.secret, (err, decodedPayload) => {
        if (err) return reject(err);

        resolve(decodedPayload);
      });
    });
  }

  private get secret(): string {
    return process.env.JWT_SECRET;
  }
}

