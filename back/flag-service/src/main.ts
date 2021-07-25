import { NestFactory } from '@nestjs/core';
import { FlagModule } from './flag/FlagModule';
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(FlagModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
