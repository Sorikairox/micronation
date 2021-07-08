import { Injectable } from '@nestjs/common';

@Injectable()
export class FlagService {
  getHello(): string {
    return 'Hello World!';
  }
}
