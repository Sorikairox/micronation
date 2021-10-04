import { NestFactory } from '@nestjs/core';
import { v4 } from 'uuid';
import { JwtExceptionFilter } from './authentication/filters/JwtExceptionFilter';
import { FlagModule } from './flag/FlagModule';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FlagService } from './flag/FlagService';
import { AuthBackend } from "./user/AuthBackend";
import { config } from 'dotenv';


export async function bootstrap(appListenPort: string | number = '3000') {
  config();
  const app = await NestFactory.create(FlagModule.register(process.env.AUTH_BACKEND as AuthBackend));
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new JwtExceptionFilter());
  app.enableCors();
  await app.listen(appListenPort);
  return app;
}

async function createPixels(app: INestApplication) {
  const flagService: FlagService = app.get<FlagService>(FlagService);
  let i = 0;
  while (i <= 100000) {
    await flagService.addPixel(v4(), `${"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)})}`);
    i++;
  }
}
