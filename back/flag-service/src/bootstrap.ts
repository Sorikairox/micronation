import { NestFactory } from '@nestjs/core';
import { JwtExceptionFilter } from './authentication/filters/JwtExceptionFilter';
import { FlagModule } from './flag/FlagModule';
import { ValidationPipe } from "@nestjs/common";

export async function bootstrap() {
  const app = await NestFactory.create(FlagModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new JwtExceptionFilter());
  await app.listen(3000);
  return app;
}
