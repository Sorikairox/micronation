import { Module } from '@nestjs/common';
import { PixelRepository } from './PixelRepository';

@Module({
  imports: [],
  controllers: [],
  providers: [PixelRepository],
  exports: [PixelRepository],
})
export class PixelModule {}
