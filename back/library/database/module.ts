import { Module, DynamicModule } from "@nestjs/common";
import { DatabaseClientService } from "./client/service";

@Module({})
export class DatabaseModule {
    static register(options): DynamicModule {
        return {
            module: DatabaseModule,
            providers: [
                {
                    provide: 'CONFIG_OPTIONS',
                    useValue: options,
                },
                {
                    provide: 'DATABASE_CLIENT',
                    useClass: DatabaseClientService,
                }
            ],
            exports: [DatabaseClientService]
        }
    }
}