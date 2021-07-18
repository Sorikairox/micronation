import { NestFactory } from '@nestjs/core';
import { FlagModule } from './flag/FlagModule';

async function bootstrap() {
  const app = await NestFactory.create(FlagModule);
  await app.listen(3000);
}
bootstrap();
