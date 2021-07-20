import { Module } from "@nestjs/common";
import { UserRepository } from "./UserRepository";
import { UserService } from "./UserService";
import { UserController } from "./UserController";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guards/AuthGuard";

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class UserModule {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length === 0 || jwtSecret === 'changeme') {
      throw new Error('JWT_SECRET environment variable is not configured!');
    }
  }
}
