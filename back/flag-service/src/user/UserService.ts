import { Injectable } from "@nestjs/common";
import { UserRepository } from "./UserRepository";
import { User } from "./User";
import argon2 from "argon2";
import { EmailAlreadyTakenError } from "./errors/EmailAlreadyTakenError";
import { NicknameAlreadyTakenError } from "./errors/NicknameAlreadyTakenError";
import { EmailNotFoundError } from "./errors/EmailNotFoundError";
import { IncorrectPasswordError } from "./errors/IncorrectPasswordError";
import { JwtService } from "./jwt/JwtService";
import { UserIdNotFoundError } from "./errors/UserIdNotFoundError";
import { ObjectID } from "mongodb";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
  }

  async register(email: string, password: string, nickname: string): Promise<User> {
    const existingUserWithEmail = await this.userRepository.findOne({ email: email });
    if (existingUserWithEmail) {
      throw new EmailAlreadyTakenError();
    }

    const existingUserWithNickname = await this.userRepository.findOne({ nickname: nickname });
    if (existingUserWithNickname) {
      throw new NicknameAlreadyTakenError();
    }

    return await this.userRepository.createAndReturn({
      email: email,
      password: await argon2.hash(password),
      nickname: nickname,
    });
  }

  async login(email: string, password: string): Promise<{ user: User, jwt: string }> {
    const user = await this.userRepository.findOne({ email: email });
    if (!user) {
      throw new EmailNotFoundError();
    }

    if (!await argon2.verify(user.password, password)) {
      throw new IncorrectPasswordError();
    }

    return {
      user: user,
      jwt: await this.jwtService.sign<UserDataJwtPayload>({
        sub: user._id,
        userData: {
          _id: user._id,
          email: user.email,
          nickname: user.nickname,
          createdAt: user.createdAt,
        },
      }, '15 days'),
    };
  }

  async changePassword(userId: string | ObjectID, currentPassword: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findOne({ _id: new ObjectID(userId) });
    if (!user) {
      throw new UserIdNotFoundError();
    }

    if (!await argon2.verify(user.password, currentPassword)) {
      throw new IncorrectPasswordError();
    }

    return await this.userRepository.updateAndReturnOne(
      { _id: user._id },
      { password: await argon2.hash(newPassword) },
    );
  }

  async changeNickname(userId: string | ObjectID, password: string, newNickname: string): Promise<User> {
    const user = await this.userRepository.findOne({ _id: new ObjectID(userId) });
    if (!user) {
      throw new UserIdNotFoundError();
    }

    if (!await argon2.verify(user.password, password)) {
      throw new IncorrectPasswordError();
    }

    const existingUserWithNickname = await this.userRepository.findOne({ nickname: newNickname });
    if (existingUserWithNickname) {
      throw new NicknameAlreadyTakenError();
    }

    return await this.userRepository.updateAndReturnOne(
      { _id: user._id },
      { nickname: newNickname },
    );
  }
}

export type UserDataJwtPayload = {
  userData: {
    _id: string,
    email: string,
    nickname: string,
    createdAt: string,
  },
};
