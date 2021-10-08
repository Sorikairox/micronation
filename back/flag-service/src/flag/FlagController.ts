import { Body, Controller, Get, InternalServerErrorException, Param, Post, Put } from '@nestjs/common';
import { Public } from '../user/decorators/Public';
import { UserId } from '../user/decorators/UserId';
import { FlagService } from './FlagService';
import { parseISO } from 'date-fns';

@Controller('')
export class FlagController {
  constructor(private flagService: FlagService) {
  }

  @Post('pixel')
  async addPixel(
    @UserId() ownerId: string,
    @Body('hexColor') hexColor: string,
  ) {
    const event = await this.flagService.addPixel(ownerId, hexColor);
    return event;
  }

  @Put('pixel')
  async changePixelColor(
      @UserId() ownerId: string,
      @Body('hexColor') hexColor: string,
  ) {
    const event = await this.flagService.changePixelColor(ownerId, hexColor);
    return event;
  }

  @Get('pixel')
  async getUserPixel(
      @UserId() userId: string,
  ) {
    return this.flagService.getOrCreateUserPixel(userId);
  }

  @Get('flag')
  @Public()
  async getFlag() {
    try {
      const flag = await this.flagService.getFlag();
      return flag;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @Get('flag/:date')
  @Public()
  async getFlagAtDate(@Param('date') requestedDate: Date) {
    try {
      const flag = await this.flagService.getFlagAtDate(requestedDate);
      return flag;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @Get('flag/after/:date')
  @Public()
  async getFlagAfterDate(@Param('date') requestedDate: Date | string) {
    try {
      if (typeof requestedDate === 'string') {
        requestedDate = parseISO(requestedDate);
      }
      const flag = await this.flagService.getFlagAfterDate(requestedDate);
      return flag;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @Get('cooldown')
  @Public()
  getChangeCooldown() {
    return {
      cooldown: Number(process.env.CHANGE_COOLDOWN),
    };
  }
}
