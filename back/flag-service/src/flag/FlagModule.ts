import { DynamicModule, Module } from '@nestjs/common';
import { FlagController } from './FlagController';
import { FlagService } from './FlagService';
import { PixelModule } from './pixel/PixelModule';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from "../user/UserModule";
import { AuthBackend } from "../user/AuthBackend";
import { FlagSnapshotModule } from './snapshot/SnapshotModule';

@Module({})
export class FlagModule {
  static register(authBackend: AuthBackend): DynamicModule {
    return {
      module: FlagModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule.register({
          uri: process.env.DATABASE_URI,
          dbName: 'micronation',
        }),
        PixelModule,
        FlagSnapshotModule,
        UserModule.register(authBackend),
      ],
      controllers: [FlagController],
      providers: [FlagService],
    };
  }
}
