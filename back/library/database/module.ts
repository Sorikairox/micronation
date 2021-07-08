import { Module, DynamicModule } from "@nestjs/common";
import { DatabaseClientService } from "./client/service";

@Module({})
export class DatabaseModule {
    static register(options): DynamicModule {
        return {
            global: true,
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
            exports: ['DATABASE_CLIENT']
        }
    }
}