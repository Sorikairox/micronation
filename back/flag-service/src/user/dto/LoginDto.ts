import { IsAlphanumeric, IsEmail, Matches, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @MinLength(6)
    @IsAlphanumeric()
    @Matches(/[a-zA-Z]/)
    @Matches(/[0-9]/)
    password: string;
}
