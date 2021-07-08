import { NestFactory } from '@nestjs/core';
import { FlagModule } from './module';

async function bootstrap() {
  const app = await NestFactory.create(FlagModule);
  await app.listen(3000);
}
bootstrap();
