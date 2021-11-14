import { Module } from '@nestjs/common';
import { PixelModule } from '../pixel/PixelModule';
import { FlagSnapshotPixelService } from './pixel/FlagSnapshotPixelService';
import { FlagSnapshotPixelRepository } from './pixel/SnapshotPixelRepository';
import { FlagSnapshotRepository } from './SnapshotRepository';
import { FlagSnapshotService } from './SnapshotService';

@Module({
  imports: [PixelModule],
  controllers: [],
  providers: [FlagSnapshotRepository, FlagSnapshotService, FlagSnapshotPixelRepository, FlagSnapshotPixelService],
  exports: [FlagSnapshotService],
})
export class FlagSnapshotModule {}
