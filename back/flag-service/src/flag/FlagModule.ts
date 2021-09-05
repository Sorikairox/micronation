import { DynamicModule, Module } from '@nestjs/common';
import { FlagController } from './FlagController';
import { FlagService } from './FlagService';
import { PixelModule } from './pixel/PixelModule';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from "../user/UserModule";
import { AuthBackend } from "../user/AuthBackend";

@Module({})
export class FlagModule {
  static register(authBackend: AuthBackend): DynamicModule {
    return {
      module: FlagModule,
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule.register({
          uri: process.env.DATABASE_URI,
          dbName: 'micronation',
        }),
        PixelModule,
        UserModule.register(authBackend),
      ],
      controllers: [FlagController],
      providers: [FlagService],
    };
  }
}
