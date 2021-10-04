import { Module } from '@nestjs/common';
import { PixelModule } from '../pixel/PixelModule';
import { FlagSnapshotRepository } from './SnapshotRepository';
import { FlagSnapshotService } from './SnapshotService';

@Module({
  imports: [PixelModule],
  controllers: [],
  providers: [FlagSnapshotRepository, FlagSnapshotService],
  exports: [FlagSnapshotService],
})
export class FlagSnapshotModule {}
