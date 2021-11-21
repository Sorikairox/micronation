import { Module } from '@nestjs/common';
import { PixelModule } from '../pixel/PixelModule';
import { FlagSnapshotPixelService } from './pixel/FlagSnapshotPixelService';
import { FlagSnapshotPixelRepository } from './pixel/FlagSnapshotPixelRepository';
import { FlagSnapshotRepository } from './FlagSnapshotRepository';
import { FlagSnapshotService } from './FlagSnapshotService';

@Module({
  imports: [PixelModule],
  controllers: [],
  providers: [FlagSnapshotRepository, FlagSnapshotService, FlagSnapshotPixelRepository, FlagSnapshotPixelService],
  exports: [FlagSnapshotService],
})
export class FlagSnapshotModule {}
