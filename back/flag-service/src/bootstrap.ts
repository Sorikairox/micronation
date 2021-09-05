import { NestFactory } from '@nestjs/core';
import { JwtExceptionFilter } from './authentication/filters/JwtExceptionFilter';
import { FlagModule } from './flag/FlagModule';
import { ValidationPipe } from "@nestjs/common";
import { AuthBackend } from "./user/AuthBackend";

export async function bootstrap(appListenPort = 3000) {
  const app = await NestFactory.create(FlagModule.register(process.env.AUTH_BACKEND as AuthBackend));
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new JwtExceptionFilter());
  await app.listen(appListenPort);
  return app;
}
