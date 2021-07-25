import { BadRequestException, Body, Controller, Post, Put, Req, Request } from "@nestjs/common";
import { UserService } from "./UserService";
import { EmailAlreadyTakenError } from "./errors/EmailAlreadyTakenError";
import { NicknameAlreadyTakenError } from "./errors/NicknameAlreadyTakenError";
import { IsAlphanumeric, IsEmail, Matches, MinLength } from "class-validator";
import { Public } from "./decorators/PublicDecorator";
import { EmailNotFoundError } from "./errors/EmailNotFoundError";
import { IncorrectPasswordError } from "./errors/IncorrectPasswordError";
import { User } from "./User";

class RegisterParams {
  @IsEmail()
  email: string;

  @MinLength(6)
  @IsAlphanumeric()
  @Matches(/[a-zA-Z]/)
  @Matches(/[0-9]/)
  password: string;

  passwordConfirmation: string;

  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/)
  nickname: string;
}

class LoginParams {
  @IsEmail()
  email: string;

  @MinLength(6)
  @IsAlphanumeric()
  @Matches(/[a-zA-Z]/)
  @Matches(/[0-9]/)
  password: string;
}

class ChangePasswordParams {
  @MinLength(6)
  @IsAlphanumeric()
  @Matches(/[a-zA-Z]/)
  @Matches(/[0-9]/)
  currentPassword: string;

  @MinLength(6)
  @IsAlphanumeric()
  @Matches(/[a-zA-Z]/)
  @Matches(/[0-9]/)
  newPassword: string;

  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/)
  newPasswordConfirmation: string;
}

class ChangeNicknameParams {
  @MinLength(6)
  @IsAlphanumeric()
  @Matches(/[a-zA-Z]/)
  @Matches(/[0-9]/)
  password: string;

  @MinLength(3)
  @Matches(/^[a-z0-9_-]+$/)
  newNickname: string;
}

@Controller({ path: "/user" })
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Post('/register')
  @Public('/user')
  async register(
    @Body() { email, password, passwordConfirmation, nickname }: RegisterParams,
  ): Promise<{ success: true }> {
    if (passwordConfirmation !== password) {
      throw new BadRequestException('passwordConfirmation', 'Password confirmation doesn\'t match.');
    }

    try {
      await this.userService.register(email, password, nickname);
      return { success: true };
    } catch (e) {
      if (e instanceof EmailAlreadyTakenError || e instanceof NicknameAlreadyTakenError) {
        throw new BadRequestException(e);
      }

      throw e;
    }
  }

  @Post('/login')
  @Public('/user')
  async login(
    @Body() { email, password }: LoginParams,
  ): Promise<any> {
    try {
      const jwtPayload = await this.userService.login(email, password);
      return jwtPayload;
    } catch (e) {
      if (e instanceof EmailNotFoundError || e instanceof IncorrectPasswordError) {
        throw new BadRequestException(e);
      }

      throw e;
    }
  }

  @Put('/change-password')
  async changePassword(
    @Req() request: Request,
    {currentPassword, newPassword, newPasswordConfirmation}: ChangePasswordParams,
  ): Promise<{ success: true }> {
    if (newPasswordConfirmation !== newPassword) {
      throw new BadRequestException('newPasswordConfirmation', 'New password confirmation doesn\'t match.');
    }

    try {
      await this.userService.changePassword(request.user._id, currentPassword, newPassword);
      return { success: true };
    } catch (e) {
      if (e instanceof IncorrectPasswordError) {
        throw new BadRequestException(e);
      }

      throw e;
    }
  }

  @Put('/change-nickname')
  async changeNickname(
    @Req() request: Request,
    {password, newNickname}: ChangeNicknameParams,
  ): Promise<{ nickname: string }> {
    try {
      const updatedUser = await this.userService.changeNickname(request.user._id, password, newNickname);
      return { nickname: updatedUser.nickname };
    } catch (e) {
      if (e instanceof IncorrectPasswordError || e instanceof NicknameAlreadyTakenError) {
        throw new BadRequestException(e);
      }

      throw e;
    }
  }
}
