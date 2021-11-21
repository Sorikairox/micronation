import { NestFactory } from '@nestjs/core';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { FlagModule } from './flag/FlagModule';
import { ValidationPipe } from '@nestjs/common';
import { FlagSnapshotService } from './flag/snapshot/FlagSnapshotService';
import { AuthBackend } from "./user/AuthBackend";
import { config } from 'dotenv';


export async function bootstrap(appListenPort: string | number = '3000') {
  config();
  const app = await NestFactory.create(FlagModule.register(process.env.AUTH_BACKEND as AuthBackend));
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(appListenPort);
  const dbClient: DatabaseClientService = app.get('DATABASE_CLIENT');
  await ignoreAllBotBasedOnUserAgent(dbClient);
  await ignoreAllBasedOnUserWhoHaveIgnoredPixel(dbClient);
  await generateSnapshot(app);
  return app;
}
async function generateSnapshot(app) {
  const snapshotService = app.get(FlagSnapshotService);
  await snapshotService.createSnapshot(808569);
}
async function ignoreAllBotBasedOnUserAgent(dbClient: DatabaseClientService) {
  const badUserAgents =  await dbClient.getDb().collection('pixel-events').aggregate([{
    $match: {
      useragent: { $exists: true, $not : { $regex: /Mozilla/ } },
    },
  },
  {
    $group: {
      _id: {
        $substrBytes: [ "$useragent", 0, 7],
      },
    },
  }]).toArray();
  for (const agent of badUserAgents) {
    await dbClient.getDb().collection('pixel-events').updateMany({ useragent: { $regex: `${agent._id}` }, action: 'update' }, {
      $set: {
        ignored: true,
      },
    })
  }
}

async function ignoreAllBasedOnUserWhoHaveIgnoredPixel(dbClient: DatabaseClientService) {
  const evilAuthor =  await dbClient.getDb().collection('pixel-events').aggregate([{
    $match: {
      ignored: true,
    },
  },
  {
    $group: {
      _id: "$author",
    },
  }]).toArray();
  for (const author of evilAuthor) {
    await dbClient.getDb().collection('pixel-events').updateMany({ author: author._id , action: 'update' }, {
      $set: {
        ignored: true,
      },
    })
  }
}
