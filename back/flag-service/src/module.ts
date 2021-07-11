import { Module } from '@nestjs/common';
import { FlagController } from './controller';
import { FlagService } from './service';
import { PixelModule } from './pixel/module';
import { DatabaseModule } from 'library/database/module';

@Module({
  imports: [
    DatabaseModule.register({
      uri: 'mongodb://127.0.0.1:27018',
      dbName: 'micronation',
    }),
    PixelModule,
  ],
  controllers: [FlagController],
  providers: [FlagService],
})
export class FlagModule {}
