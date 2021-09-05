import { IsAlphanumeric, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
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

  @MinLength(6)
  @IsAlphanumeric()
  @Matches(/[a-zA-Z]/)
  @Matches(/[0-9]/)
  newPasswordConfirmation: string;
}
