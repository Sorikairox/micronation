import { Module } from '@nestjs/common';
import { FlagController } from './controller';
import { FlagService } from './service';

@Module({
  imports: [],
  controllers: [FlagController],
  providers: [FlagService],
})
export class FlagModule {}
