import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./UserService";

@Controller({ path: "/user" })
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Post('/register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('passwordConfirmation') passwordConfirmation: string,
    @Body('nickname') nickname: string,
  ): Promise<{ success: true }> {
    throw new Error('Not implemented');
  }

  @Post('/login')
  async login(
    @Body('nicknameOrEmail') nicknameOrEmail: string,
    @Body('password') password: string,
  ): Promise<any> {
    throw new Error('Not implemented');
  }

  @Post('/change-password')
  async changePassword(
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Body('newPasswordConfirmation') newPasswordConfirmation: string,
  ): Promise<{ success: true }> {
    throw new Error('Not implemented');
  }

  @Post('/change-nickname')
  async changeNickname(
    @Body('password') password: string,
    @Body('newNickname') newNickname: string,
  ): Promise<{ nickname: string }> {
    throw new Error('Not implemented');
  }
}
