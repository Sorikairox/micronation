import { BadRequestException, Body, Controller, Post, Put, Req, Request } from '@nestjs/common';
import { ChangeNicknameDto } from './dto/ChangeNicknameDto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { LoginDto } from './dto/LoginDto';
import { RegisterDto } from './dto/RegisterDto';
import { UserService } from "./UserService";
import { Public } from "./decorators/Public";


@Controller({ path: "/user" })
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Post('/register')
  @Public()
  async register(
    @Body() { email, password, passwordConfirmation, nickname }: RegisterDto,
  ): Promise<{ success: true }> {
    if (passwordConfirmation !== password) {
      throw new BadRequestException('passwordConfirmation', 'Password confirmation doesn\'t match.');
    }

    await this.userService.register(email, password, nickname);
    return { success: true };
  }

  @Post('/login')
  @Public()
  async login(
    @Body() { email, password }: LoginDto,
  ): Promise<any> {
    const jwtPayload = await this.userService.login(email, password);
    return jwtPayload;
  }

  @Put('/change-password')
  async changePassword(
    @Req() request: Request,
    @Body() { currentPassword, newPassword, newPasswordConfirmation }: ChangePasswordDto,
  ): Promise<{ success: true }> {
    if (newPasswordConfirmation !== newPassword) {
      throw new BadRequestException('newPasswordConfirmation', 'New password confirmation doesn\'t match.');
    }
    await this.userService.changePassword(request.userId, currentPassword, newPassword);
    return { success: true };
  }

  @Put('/change-nickname')
  async changeNickname(
    @Req() request: Request,
    @Body() { password, newNickname }: ChangeNicknameDto,
  ): Promise<{ nickname: string }> {
    const updatedUser = await this.userService.changeNickname(request.userId, password, newNickname);
    return { nickname: updatedUser.nickname };
  }
}
