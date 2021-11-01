import { CanActivate, Injectable, ServiceUnavailableException } from "@nestjs/common";

@Injectable()
export class MaintenanceGuard implements CanActivate {
  canActivate(): boolean {
    if (process.env.MAINTENANCE_MODE === 'true') {
      throw new ServiceUnavailableException();
    }

    return true;
  }
}
