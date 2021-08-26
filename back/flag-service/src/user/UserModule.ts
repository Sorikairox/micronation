import { Module } from "@nestjs/common";
import { UserRepository } from "./UserRepository";
import { UserService } from "./UserService";
import { UserController } from "./UserController";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "./jwt/JwtService";
import { FouloscopieAuthGuard } from "./guards/FouloscopieAuthGuard";

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: FouloscopieAuthGuard,
    },
    UserRepository,
  ],
  exports: [UserRepository],
})
export class UserModule {
}
