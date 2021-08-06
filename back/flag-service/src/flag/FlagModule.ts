import { Module } from '@nestjs/common';
import { FlagController } from './FlagController';
import { FlagService } from './FlagService';
import { PixelModule } from './pixel/PixelModule';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from "../user/UserModule";

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule.register({
      uri: process.env.DATABASE_URI,
      dbName: 'micronation',
    }),
    PixelModule,
    UserModule,
  ],
  controllers: [FlagController],
  providers: [FlagService],
})
export class FlagModule {}
