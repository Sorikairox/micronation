import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetPixelDto } from '../pixel/dto/GetPixelDto';
import { PixelRepository } from '../pixel/PixelRepository';
import { FlagSnapshotPixelService } from './pixel/FlagSnapshotPixelService';
import { FlagSnapshot } from './FlagSnapshot';
import { FlagSnapshotRepository } from './FlagSnapshotRepository';
import { FlagSnapshotDto } from "./dto/FlagSnapshotDto";

@Injectable()
export class FlagSnapshotService {
  private lastSnapshot: FlagSnapshotDto;

  constructor(private snapshotRepository: FlagSnapshotRepository, private configService: ConfigService, private pixelRepository: PixelRepository, private snapshotPixelService: FlagSnapshotPixelService) {}
  async getLatestSnapshot(): Promise<FlagSnapshotDto> {
    if (!this.lastSnapshot) {
      const latestSnapshot = await this.snapshotRepository.findLastByDate({ complete: true });
      if (latestSnapshot) {
        await this.setLastSnapshotValueWithLatestSnapshot(latestSnapshot);
      }
      return this.lastSnapshot;
    } else {
      const latestSnapshot = await this.snapshotRepository.findLastByDate({ complete: true, lastEventId: { $gt : this.lastSnapshot.lastEventId } });
      if (latestSnapshot) {
        await this.setLastSnapshotValueWithLatestSnapshot(latestSnapshot);
      }
      return this.lastSnapshot;
    }
  }

  async setLastSnapshotValueWithLatestSnapshot(latestSnapshot: FlagSnapshot) {
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
  }

  async createSnapshotIfEventIdMeetThreshold(eventId: number) {
    if (eventId % this.configService.get<number>('EVENTS_PER_SNAPSHOT') === 0) {
      return this.createSnapshot(eventId);
    }
  }

  async createSnapshot(snapshotLastEventId: number) {
    const pixelArray = await this.getPixelsForSnapshot(snapshotLastEventId);
    const createdSnapshot = await this.createNewEmptySnapshot(snapshotLastEventId);
    const pixels = await this.snapshotPixelService.saveSnapshotPixels(createdSnapshot._id.toHexString(), pixelArray);
    await this.snapshotRepository.updateAndReturnOne({ _id: createdSnapshot._id }, { complete: true });
    return pixels;
  }

  public async createNewEmptySnapshot(lastEventId: number): Promise<FlagSnapshot> {
    return this.snapshotRepository.createAndReturn({ lastEventId: lastEventId, complete: false });
  }

  public async getPixelsForSnapshot(lastEventId: number): Promise<GetPixelDto[]> {
    const previousSnapshot = await this.snapshotRepository.findLastByDate({});
    let pixelArray;
    if (!previousSnapshot) {
      pixelArray = await this.pixelRepository.getPixelsUntilEventId(lastEventId);
    } else {
      let lastSnapshotPixel;
      if (previousSnapshot.pixels) {
        lastSnapshotPixel = previousSnapshot.pixels;
      } else {
        lastSnapshotPixel = await this.snapshotPixelService.getSnapshotPixels(previousSnapshot._id.toHexString());
      }
      const arrayPixelNotInSnapshot = await this.pixelRepository.getPixelsBetweenEventIds(previousSnapshot.lastEventId, lastEventId);
      pixelArray = this.mergeArray(lastSnapshotPixel, arrayPixelNotInSnapshot);
    }
    return pixelArray;
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
