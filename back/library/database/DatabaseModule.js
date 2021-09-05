"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const DatabaseClientService_1 = require("./client/DatabaseClientService");
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    static register(options) {
        return {
            global: true,
            module: DatabaseModule_1,
            providers: [
                {
                    provide: 'CONFIG_OPTIONS',
                    useValue: options,
                },
                {
                    provide: 'DATABASE_CLIENT',
                    useClass: DatabaseClientService_1.DatabaseClientService,
                }
            ],
            exports: ['DATABASE_CLIENT']
        };
    }
};
DatabaseModule = DatabaseModule_1 = __decorate([
    common_1.Module({})
], DatabaseModule);
exports.DatabaseModule = DatabaseModule;
//# sourceMappingURL=DatabaseModule.js.map