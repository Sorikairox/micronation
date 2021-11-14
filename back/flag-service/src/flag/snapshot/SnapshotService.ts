import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PixelRepository } from '../pixel/PixelRepository';
import { FlagSnapshot } from './Snapshot';
import { FlagSnapshotRepository } from './SnapshotRepository';

@Injectable()
export class FlagSnapshotService {
  private lastSnapshot: FlagSnapshot;

  constructor(private snapshotRepository: FlagSnapshotRepository, private configService: ConfigService, private pixelRepository: PixelRepository) {}
  async getLatestSnapshot() {
    if (!this.lastSnapshot) {
      this.lastSnapshot = await this.snapshotRepository.findLastByDate({});
      return this.lastSnapshot;
    } else {
      const newerSnapshot = await this.snapshotRepository.findLastByDate({ lastEventId: { $gt : this.lastSnapshot.lastEventId } });
      if (newerSnapshot) {
        this.lastSnapshot = newerSnapshot;
      }
      return this.lastSnapshot;
    }
  }

  async createSnapshotIfEventIdMeetThreshold(eventId: number) {
    if (eventId % this.configService.get<number>('EVENTS_PER_SNAPSHOT') === 0) {
      this.lastSnapshot = await this.createSnapShot(eventId);
      return this.lastSnapshot;
    }
  }

  async createSnapShot(eventId: number) {
    const lastSnapshot = await this.snapshotRepository.findLastByDate({});
    if (!lastSnapshot) {
      const arrayPixel = await this.pixelRepository.getPixelsUntilEventId(eventId);
      return this.snapshotRepository.createAndReturn({ lastEventId: eventId, pixels: arrayPixel });
    } else {
      const arrayPixelNotInSnapshot = await this.pixelRepository.getPixelsBetweenEventIds(lastSnapshot.lastEventId, eventId);
      const newSnapshotArray = this.mergeArray(lastSnapshot.pixels, arrayPixelNotInSnapshot);
      return this.snapshotRepository.createAndReturn({ lastEventId: eventId, pixels: newSnapshotArray });
    }
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
        returnedArray[indexInFlagToLocalIndexMap[pixel.indexInFlag]].hexColor = pixel.hexColor;
      }
    }
    return returnedArray;
  }
}
