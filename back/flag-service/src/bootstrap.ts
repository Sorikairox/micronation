import { NestFactory } from '@nestjs/core';
import { set, sub } from 'date-fns';
import { FlagModule } from './flag/FlagModule';
import { ValidationPipe } from '@nestjs/common';
import { FlagService } from './flag/FlagService';
import { ImageService } from './flag/image/ImageService';
import { AuthBackend } from "./user/AuthBackend";
import { config } from 'dotenv';
import { isAfter, format } from 'date-fns';


export async function bootstrap(appListenPort: string | number = '3000') {
  config();
  const app = await NestFactory.create(FlagModule.register(process.env.AUTH_BACKEND as AuthBackend));
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: [/\.fouloscopie\.com$/] });
  await app.listen(appListenPort);
  const flagService = app.get(FlagService);
  const imageService = app.get(ImageService);
  let actualDate = new Date();
  actualDate = set(actualDate, { year: 2021, date: 21, hours: 12 });
  while (isAfter(actualDate, new Date(2021, 10, 13))) {
    const pixels = await flagService.getFlagAtDate(actualDate);
    const image = await imageService.generateImageFromPixelArray(pixels, 131815, 1/2);
    const filename = 'flag-' + format(actualDate, 'yyyy-MM-dd') + '.png';
    await image.writeAsync('./' + filename);
    console.log('generated ' + filename);
    actualDate = sub(actualDate, { hours: 24 });
  }
  return app;
}
