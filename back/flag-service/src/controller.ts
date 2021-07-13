import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { FlagService } from './service';
import { CooldownTimerHasNotEndedYet, UserAlreadyOwnAPixelError } from './errors';

@Controller('')
export class FlagController {
  constructor(private flagService: FlagService) {}

  @Post('pixel')
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

  @Put('pixel')
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
      if (e instanceof CooldownTimerHasNotEndedYet) {
        throw new BadRequestException();
      }
    }
  }

  @Get('flag')
  async getFlag() {
    try {
      const flag = await this.flagService.getFlag();
      return flag;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @Get('flag/:date')
  async getFlagAtDate(@Param('date') requestedDate: Date) {
    try {
      const flag = await this.flagService.getFlagAtDate(requestedDate);
      return flag;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
