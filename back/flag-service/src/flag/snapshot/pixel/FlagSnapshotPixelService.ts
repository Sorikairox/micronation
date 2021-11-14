import { Injectable } from '@nestjs/common';
import { GetPixelDto } from '../../pixel/dto/GetPixelDto';
import { FlagSnapshotPixelRepository } from './SnapshotPixelRepository';

@Injectable()
export class FlagSnapshotPixelService {

  constructor(private snapshotPixelRepository: FlagSnapshotPixelRepository) {}

  async saveSnapshotPixels(snapshotId: string, pixelsData: Array<GetPixelDto>) {
    const snapshotPixelsArray = pixelsData.map(p => ({ ...p, snapshotId }));
    return this.snapshotPixelRepository.createMany(snapshotPixelsArray);
  }

  async getSnapshotPixels(snapshotId: string) {
    return this.snapshotPixelRepository.find({ snapshotId },{ indexInFlag: 1 }, { snapshotId: 0, _id: 0, createdAt: 0 });
  }
}
