import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PixelRepository } from '../pixel/PixelRepository';
import { FlagSnapshotRepository } from './SnapshotRepository';

@Injectable()
export class FlagSnapshotService {
  constructor(private snapshotRepository: FlagSnapshotRepository, private configService: ConfigService, private pixelRepository: PixelRepository) {}

  async getLatestSnapshot() {
    return this.snapshotRepository.findLast({});
  }

  createSnapshotIfEventIdMeetThreshold(eventId: number) {
    if (eventId % this.configService.get<number>('EVENTS_PER_SNAPSHOT') === 0) {
      return this.createSnapShot(eventId);
    }
  }

  async createSnapShot(eventId: number) {
    const arrayPixel = await this.pixelRepository.getPixelsUntilEventId(eventId);
    return this.snapshotRepository.createAndReturn({ lastEventId: eventId, pixels: arrayPixel });
  }

  mergeArray(baseDataArray, newDataArray) {
    const returnedArray = baseDataArray;
    const indexInFlagToLocalIndexMap = {};
    for (let i = 0; i < baseDataArray.length; i++) {
      indexInFlagToLocalIndexMap[baseDataArray[i].indexInFlag] = i;
    }
    for (const pixel of newDataArray) {
      const localIndex = indexInFlagToLocalIndexMap[pixel.indexInFlag];
      if (localIndex == null) {
        returnedArray.push(pixel);
        indexInFlagToLocalIndexMap[pixel.indexInFlag] = returnedArray.length - 1;
      } else {
        returnedArray[indexInFlagToLocalIndexMap[pixel.indexInFlag]] = pixel;
      }
    }
    return returnedArray;
  }
}
