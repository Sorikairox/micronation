import { Controller, Get } from '@nestjs/common';
import { FlagService } from './service';

@Controller()
export class FlagController {
  constructor(private readonly appService: FlagService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
