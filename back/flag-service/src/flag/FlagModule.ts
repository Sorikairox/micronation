import { Module } from '@nestjs/common';
import { FlagController } from './FlagController';
import { FlagService } from './FlagService';
import { PixelModule } from './pixel/PixelModule';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule.register({
      uri: process.env.DATABASE_URI,
      dbName: 'micronation',
    }),
    PixelModule,
  ],
  controllers: [FlagController],
  providers: [FlagService],
})
export class FlagModule {}
