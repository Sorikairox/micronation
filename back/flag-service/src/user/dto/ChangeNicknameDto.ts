import { IsAlphanumeric, Matches, MinLength } from 'class-validator';
export class ChangeNicknameDto {
    @MinLength(6)
    @IsAlphanumeric()
    @Matches(/[a-zA-Z]/)
    @Matches(/[0-9]/)
    password: string;

    @MinLength(3)
    @Matches(/^[a-z0-9_-]+$/)
    newNickname: string;
}
