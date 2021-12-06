import { Controller, Get } from '@nestjs/common';
import { Public } from '../../user/decorators/Public';
import { FlagStatService } from './FlagStatService';

@Controller('stat')
export class FlagStatController {
  constructor(private statService: FlagStatService) {
  }

  @Public()
  @Get('update-day-ranking')
  getDaysRankedByUpdateNumberDesc() {
    return this.statService.getUpdateDayRanking();
  }

  @Public()
  @Get('creation-day-ranking')
  getDaysRankedByCreationNumberDesc() {
    return this.statService.getCreationDayRanking();
  }

  @Public()
  @Get('color-ranking')
  getColorRanking() {
    return this.statService.getColorRanking();
  }

  @Public()
  @Get('user-ranking')
  getUserRanking() {
    return this.statService.getUserRanking();
  }

  @Public()
  @Get('pixel-ranking')
  gePixelRanking() {
    return this.statService.getPixelRanking();
  }

}
