import { Injectable } from '@nestjs/common';
import { PixelRepository } from '../pixel/PixelRepository';
import { mapCoordinatesToTargetRatioRectangleDistribution } from '../utils';
import { PixelRankingDTO } from './dto/PixelRankingDTO';

@Injectable()
export class FlagStatService {
  constructor(private pixelRepository: PixelRepository) {
  }

  async getUpdateDayRanking() {
    return this.pixelRepository.getDayRankedByUpdateNumber();
  }

  async getCreationDayRanking() {
    return this.pixelRepository.getDayRankedByCreationNumber();
  }

  async getColorRanking() {
    return this.pixelRepository.getColorRanking();
  }

  async getUserRanking() {
    return this.pixelRepository.getUserRanking();
  }

  async getPixelRanking(): Promise<PixelRankingDTO[]> {
    const pixelRanking = await this.pixelRepository.getPixelRanking();
    const flag = await this.pixelRepository.getPixels();
    const worldCoordinatesArray = mapCoordinatesToTargetRatioRectangleDistribution(flag.length, 1/2);
    const pixelIdToWorldCoordinateMap = {};
    let i = 0
    for (const coordinate of worldCoordinatesArray) {
      pixelIdToWorldCoordinateMap[flag[i].entityId] = coordinate;
      i++;
    }
    for (const pixel of pixelRanking) {
      pixel.x = pixelIdToWorldCoordinateMap[pixel._id].x;
      pixel.y = pixelIdToWorldCoordinateMap[pixel._id].y;
    }
    return pixelRanking;
  }
}
