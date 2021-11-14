import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PixelRepository } from '../pixel/PixelRepository';
import { FlagSnapshotDto } from './dto/FlagSnapshotDto';
import { FlagSnapshotPixelService } from './pixel/FlagSnapshotPixelService';
import { FlagSnapshotPixelRepository } from './pixel/SnapshotPixelRepository';
import { FlagSnapshot } from './Snapshot';
import { FlagSnapshotRepository } from './SnapshotRepository';

@Injectable()
export class FlagSnapshotService {
  private lastSnapshot: FlagSnapshotDto;

  constructor(private snapshotRepository: FlagSnapshotRepository, private configService: ConfigService, private pixelRepository: PixelRepository, private snapshotPixelService: FlagSnapshotPixelService) {}
  async getLatestSnapshot(): Promise<FlagSnapshotDto> {
    if (!this.lastSnapshot) {
      const latestSnapshot = await this.snapshotRepository.findLastByDate({});
      await this.setLastSnapshotValueWithLatestSnapshot(latestSnapshot);
      return this.lastSnapshot;
    } else {
      const latestSnapshot = await this.snapshotRepository.findLastByDate({ lastEventId: { $gt : this.lastSnapshot.lastEventId } });
      await this.setLastSnapshotValueWithLatestSnapshot(latestSnapshot);
      return this.lastSnapshot;
    }
  }

  async setLastSnapshotValueWithLatestSnapshot(latestSnapshot: FlagSnapshot) {
    if (latestSnapshot) {
      let latestSnapshotPixels;
      if (latestSnapshot.pixels) {
        latestSnapshotPixels = latestSnapshot.pixels;
      } else {
        latestSnapshotPixels = await this.snapshotPixelService.getSnapshotPixels(latestSnapshot._id.toHexString());
      }
      if (latestSnapshotPixels.length > 0) {
        this.lastSnapshot = {
          ...latestSnapshot,
          _id: latestSnapshot._id.toHexString(),
          pixels: latestSnapshotPixels,
        };
      }
    } else {
      this.lastSnapshot = null;
    }
  }

  async createSnapshotIfEventIdMeetThreshold(eventId: number) {
    if (eventId % this.configService.get<number>('EVENTS_PER_SNAPSHOT') === 0) {
      return this.createSnapShot(eventId);
    }
  }

  async createSnapShot(eventId: number) {
    const lastSnapshot = await this.snapshotRepository.findLastByDate({});
    let pixelArray;
    if (!lastSnapshot) {
      pixelArray = await this.pixelRepository.getPixelsUntilEventId(eventId);
    } else {
      let lastSnapshotPixel;
      if (lastSnapshot.pixels) {
        lastSnapshotPixel = lastSnapshot.pixels;
      } else {
        lastSnapshotPixel = await this.snapshotPixelService.getSnapshotPixels(lastSnapshot._id.toHexString());
      }
      const arrayPixelNotInSnapshot = await this.pixelRepository.getPixelsBetweenEventIds(lastSnapshot.lastEventId, eventId);
      pixelArray = this.mergeArray(lastSnapshotPixel, arrayPixelNotInSnapshot);
    }
    const createdSnapshot = await this.snapshotRepository.createAndReturn({ lastEventId: eventId });
    return this.snapshotPixelService.saveSnapshotPixels(createdSnapshot._id.toHexString(), pixelArray);
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
