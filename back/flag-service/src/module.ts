import { Module } from '@nestjs/common';
import { FlagController } from './controller';
import { FlagService } from './service';
import { PixelModule } from './pixel/module';
import { DatabaseModule } from 'library/database/module';
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
