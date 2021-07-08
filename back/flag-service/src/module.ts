import { Module } from '@nestjs/common';
import { FlagController } from './controller';
import { FlagService } from './service';
import { PixelModule } from "./pixel/module";

@Module({
  imports: [PixelModule],
  controllers: [FlagController],
  providers: [FlagService],
})
export class FlagModule {}
