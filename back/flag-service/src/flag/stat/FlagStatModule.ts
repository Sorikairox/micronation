import { Module } from '@nestjs/common';
import { PixelRepository } from '../pixel/PixelRepository';
import { FlagStatController } from './FlagStatController';
import { FlagStatService } from './FlagStatService';

@Module({
  imports: [],
  controllers: [FlagStatController],
  providers: [FlagStatService, PixelRepository],
  exports: [FlagStatService],
})
export class FlagStatModule {}
