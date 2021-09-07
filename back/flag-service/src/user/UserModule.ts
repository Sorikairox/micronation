import { CanActivate, DynamicModule, Module, Provider, Type } from "@nestjs/common";
import { UserRepository } from "./UserRepository";
import { UserController } from "./UserController";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "./jwt/JwtService";
import { FouloscopieAuthGuard } from "./guards/FouloscopieAuthGuard";
import { AuthGuard } from "./guards/AuthGuard";
import { AuthBackend } from "./AuthBackend";
import { UserService } from "./UserService";
import { ForwardReference } from "@nestjs/common/interfaces/modules/forward-reference.interface";
import { Abstract } from "@nestjs/common/interfaces/abstract.interface";

@Module({})
export class UserModule {
  public static register(authBackend: AuthBackend): DynamicModule {
    return {
      module: UserModule,
      imports: [],
      controllers: this.getControllers(authBackend),
      providers: this.getProviders(authBackend),
      exports: this.getExports(authBackend),
    };
  }

  private static getControllers(authBackend: AuthBackend): Type[] {
    const controllers = [];

    if (authBackend === AuthBackend.INTERNAL) {
      controllers.push(UserController);
    }

    return controllers;
  }

  private static getProviders(authBackend: AuthBackend): Provider[] {
    const providers: Provider[] = [
      JwtService,
      {
        provide: APP_GUARD,
        useClass: this.getAuthGuardClass(authBackend),
      },
      UserRepository,
    ];

    if (authBackend === AuthBackend.INTERNAL) {
      providers.push(UserService);
    }

    return providers;
  }

  private static getExports(authBackend: AuthBackend): Array<DynamicModule | Promise<DynamicModule> | string | symbol | Provider | ForwardReference | Abstract<any> | Function> {
    const repositories = [];

    if (authBackend === AuthBackend.INTERNAL) {
      repositories.push(UserRepository);
    }

    return repositories;
  }

  private static getAuthGuardClass(authBackend: AuthBackend): Type<CanActivate> {
    switch (authBackend) {
    case AuthBackend.FOULOSCOPIE:
      return FouloscopieAuthGuard;
    case AuthBackend.INTERNAL:
      return AuthGuard;
    default:
      throw new Error('Invalid AUTH_BACKEND: ' + authBackend);
    }
  }
}
