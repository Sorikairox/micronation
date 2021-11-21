import { NestFactory } from '@nestjs/core';
import { FlagModule } from './flag/FlagModule';
import { ValidationPipe } from '@nestjs/common';
import { AuthBackend } from "./user/AuthBackend";
import { config } from 'dotenv';


export async function bootstrap(appListenPort: string | number = '3000') {
  config();
  const app = await NestFactory.create(FlagModule.register(process.env.AUTH_BACKEND as AuthBackend));
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: [/\.fouloscopie\.com$/] });
  await app.listen(appListenPort);
  return app;
}
