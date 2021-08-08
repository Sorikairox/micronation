import { IsAlphanumeric, IsEmail, Matches, MinLength } from 'class-validator';

export class RegisterDto {
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
