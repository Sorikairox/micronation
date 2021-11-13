import { IsString, Matches } from 'class-validator';

export class ChangePixelColorDto {

  @IsString()
  @Matches( /^#[0-9a-f]{6}$/i)
  public hexColor: string;

  @IsString()
  public pixelId: string;
}
