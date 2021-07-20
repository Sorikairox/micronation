import { Injectable } from "@nestjs/common";
import { UserRepository } from "./UserRepository";
import { User } from "./User";

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
  ) {
  }

  async register(email: string, password: string, nickname: string): Promise<User> {
    throw new Error('Not implemented');
  }

  async login(email: string, password: string): Promise<{ user: User, jwt: string }> {
    throw new Error('Not implemented');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
    throw new Error('Not implemented');
  }

  async changeNickname(userId: string, password: string, newNickname: string): Promise<User> {
    throw new Error('Not implemented');
  }
}
