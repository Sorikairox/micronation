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
    const lastSnapshot = await this.snapshotRepository.findLast({});
    if (!lastSnapshot) {
      const arrayPixel = await this.pixelRepository.getPixelsUntilEventId(eventId);
      return this.snapshotRepository.createAndReturn({ lastEventId: eventId, pixels: arrayPixel });
    } else {
      const arrayPixelNotInSnapshot = await this.pixelRepository.getPixelsBetweenEventIds(lastSnapshot.lastEventId, eventId);
      const newSnapshotArray = this.mergeArray(lastSnapshot.pixels, arrayPixelNotInSnapshot);
      return this.snapshotRepository.createAndReturn({ lastEventId: eventId, pixels: newSnapshotArray });
    }
  }

  mergeArray(baseDataArray, newDataArray) {
    const returnedArray = baseDataArray;
    for (const pixel of newDataArray) {
      returnedArray[pixel.indexInFlag - 1] = pixel;
    }
    return returnedArray;
  }
}
