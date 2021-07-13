import { BadRequestException, Body, Controller } from '@nestjs/common';
import { FlagService } from './service';
import { UserAlreadyOwnAPixelError } from './errors';

@Controller()
export class FlagController {
  constructor(private flagService: FlagService) {}

  async addPixel(
    @Body('ownerId') ownerId: string,
    @Body('hexColor') hexColor: string,
  ) {
    try {
      const event = await this.flagService.addPixel(ownerId, hexColor);
      return event;
    } catch (e) {
      if (e instanceof UserAlreadyOwnAPixelError) {
        throw new BadRequestException();
      }
    }
  }

  async changePixelColor(
    @Body('ownerId') ownerId: string,
    @Body('pixelId') pixelId: string,
    @Body('hexColor') hexColor: string,
  ) {
    try {
      const event = await this.flagService.changePixelColor(
        ownerId,
        pixelId,
        hexColor,
      );
      return event;
    } catch (e) {
      if (e instanceof UserAlreadyOwnAPixelError) {
        throw new BadRequestException();
      }
    }
  }
}
