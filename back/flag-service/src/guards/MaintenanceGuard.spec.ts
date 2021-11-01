import { MaintenanceGuard } from "./MaintenanceGuard";
import { ServiceUnavailableException } from "@nestjs/common";

describe('MaintenanceGuard', () => {
  const maintenanceGuard = new MaintenanceGuard();
  let previousMaintenanceMode;
  beforeAll(() => {
    previousMaintenanceMode = process.env.MAINTENANCE_MODE;
  });
  afterAll(() => {
    process.env.MAINTENANCE_MODE = previousMaintenanceMode;
  });

  test('returns true when not in maintenance mode', () => {
    process.env.MAINTENANCE_MODE = 'false';
    expect(maintenanceGuard.canActivate()).toBe(true);
  });

  test('throws ServiceUnavailableException when in maintenance mode', () => {
    process.env.MAINTENANCE_MODE = 'true';
    expect(maintenanceGuard.canActivate).toThrow(ServiceUnavailableException);
  });
});
