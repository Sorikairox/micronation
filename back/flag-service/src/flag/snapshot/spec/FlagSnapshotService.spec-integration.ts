import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';
import { v4 } from 'uuid';
import { Pixel } from '../../pixel/Pixel';
import { PixelRepository } from '../../pixel/PixelRepository';
import { FlagSnapshot } from '../FlagSnapshot';
import { FlagSnapshotPixelRepository } from '../pixel/FlagSnapshotPixelRepository';
import { FlagSnapshotModule } from '../FlagSnapshotModule';
import { FlagSnapshotRepository } from '../FlagSnapshotRepository';
import { FlagSnapshotService } from '../FlagSnapshotService';

let flagSnapshotService: FlagSnapshotService;
let dbClientService: DatabaseClientService;
let pixelRepository: PixelRepository;
let flagSnapshotRepository: FlagSnapshotRepository;
let flagSnapshotPixelRepository: FlagSnapshotPixelRepository;
let app : TestingModule;

async function clean() {
  await dbClientService
    .getDb()
    .collection(pixelRepository.getCollectionName())
    .deleteMany({});
  await dbClientService
    .getDb()
    .collection('counter')
    .deleteMany({});
  await dbClientService
    .getDb()
    .collection(flagSnapshotRepository.getCollectionName())
    .deleteMany({});
  await dbClientService
    .getDb()
    .collection(flagSnapshotPixelRepository.getCollectionName())
    .deleteMany({});
}

async function init() {
  app = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      DatabaseModule.register({
        uri: process.env.DATABASE_URI,
        dbName: 'testDb',
      }),
      FlagSnapshotModule,
    ],
    controllers: [],
    providers: [],
  }).compile();
  flagSnapshotService = app.get<FlagSnapshotService>(FlagSnapshotService);
  dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
  pixelRepository = app.get<PixelRepository>(PixelRepository);
  flagSnapshotRepository = app.get<FlagSnapshotRepository>(FlagSnapshotRepository);
  flagSnapshotPixelRepository = app.get<FlagSnapshotPixelRepository>(FlagSnapshotPixelRepository);
  await dbClientService.onModuleInit();
}

async function createPixelEvent(eventId: number): Promise<DatabaseEvent<Pixel>> {
  const event = new DatabaseEvent()
  event.action = 'creation';
  event.author = v4();
  event.entityId = v4();
  event.eventId = eventId;
  event.data = new Pixel(event.author, `${"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)})}`, event.entityId, eventId);
  event.createdAt = new Date();
  await pixelRepository.createAndReturn(event);
  return event;
}

async function createManyPixel(numberOfPixels: number): Promise<any[]> {
  let i = 0;
  const createdPixels = [];
  while (i < numberOfPixels) {
    const createdEvent = await createPixelEvent(i);
    createdPixels.push({
      entityId: createdEvent.entityId,
      hexColor: createdEvent.data.hexColor,
      lastUpdate: createdEvent.createdAt,
      author: createdEvent.author,
      createdAt: createdEvent.createdAt,
      indexInFlag: createdEvent.data.indexInFlag,
    });
    i++;
  }
  return createdPixels;
}

describe('FlagSnapshotService', () => {

  beforeAll(async () => {
    await init();
    await clean();
  });

  afterAll(async () => {
    await app.close();
    await dbClientService.client.close();
  });

  afterEach(async () => {
    await app.close();
    await init();
    await clean();
  });

  describe(FlagSnapshotService.prototype.createSnapshot, () => {
    describe('when no previous snapshot', () => {
      let createdPixels = [];
      let snapshot: FlagSnapshot;
      beforeEach(async () => {
        createdPixels = await createManyPixel(9);
        await flagSnapshotService.createSnapshot(9);
        snapshot = await flagSnapshotRepository.findLastByDate({});
      });
      it ('create snapshot with aggregation', async () => {
        expect(snapshot.lastEventId).toEqual(9);
        expect(snapshot.complete).toBe(true);
      });
      it('adds createdPixels in DB', async () => {
        const pixelsInDb = await flagSnapshotPixelRepository.find({ snapshotId: snapshot._id.toHexString() });
        function filterPixelFields(pixels) {
          return pixels.map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag }));
        }
        expect(filterPixelFields(pixelsInDb)).toEqual(filterPixelFields(createdPixels));
      });
    });

    describe('with previous legacy snapshot', () => {
      let createdPixels = [];
      beforeAll(async () => {
        createdPixels = await createManyPixel(35);
        await flagSnapshotRepository.createAndReturn({
          pixels: createdPixels.slice(0, 15).map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })) as any,
          lastEventId: 15,
          complete: true,
        });
      });
      it ('creates snapshot based on previous legacy snapshot', async () => {
        await flagSnapshotService.createSnapshot(35);
        const snapshot = await flagSnapshotService.getLatestSnapshot();
        expect(snapshot.lastEventId).toEqual(35);
        expect(snapshot.pixels).toEqual(createdPixels.map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })));
      });
    });

    describe('with previous snapshot', () => {
      let createdPixels = [];
      beforeAll(async () => {
        createdPixels = await createManyPixel(35);
        await flagSnapshotService.createSnapshot(15);
      });
      it ('creates snapshot based on previous snapshot', async () => {
        await flagSnapshotService.createSnapshot(35);
        const snapshot = await flagSnapshotService.getLatestSnapshot();
        expect(snapshot.lastEventId).toEqual(35);
        expect(snapshot.pixels).toEqual(createdPixels.map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })));
      });
    });
  });

  describe(FlagSnapshotService.prototype.getLatestSnapshot, () => {
    describe('when no previous snapshot', () => {
      it ('returns undefined', async () => {
        const snapshot = await flagSnapshotService.getLatestSnapshot();
        expect(snapshot).toBe(undefined);
      });
    });
    describe('with previous snapshot', () => {
      let createdPixels = [];
      beforeEach(async () => {
        createdPixels = await createManyPixel(40);
        await flagSnapshotService.createSnapshot(15);
      });
      it ('get snapshot when no newer', async () => {
        const snapshot = await flagSnapshotService.getLatestSnapshot();
        expect(snapshot.lastEventId).toEqual(15);
        expect(snapshot.pixels).toEqual(createdPixels.slice(0, 15).map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })));
      });
      it ('get newer snapshot when there is a newer', async () => {
        const snapshot = await flagSnapshotRepository.createAndReturn({
          lastEventId: 40,
          complete: true,
        });
        await Promise.all(createdPixels.map(async p => {
          await flagSnapshotPixelRepository.createAndReturn({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag, snapshotId: snapshot._id.toHexString() })
        }) as any);

        const latestSnapshot = await flagSnapshotService.getLatestSnapshot();
        expect(latestSnapshot.lastEventId).toEqual(40);
        expect(latestSnapshot.pixels).toEqual(createdPixels.map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })));
      });

      it ('get second last snapshot when last is not complete', async () => {
        const completeSnapshot = await flagSnapshotRepository.createAndReturn({
          lastEventId: 35,
          complete: true,
        });
        await Promise.all(createdPixels.slice(0, 35).map(async p => {
          await flagSnapshotPixelRepository.createAndReturn({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag, snapshotId: completeSnapshot._id.toHexString() })
        }) as any);

        const incompleteSnapshot = await flagSnapshotRepository.createAndReturn({
          lastEventId: 40,
          complete: false,
        });
        await Promise.all(createdPixels.map(async p => {
          await flagSnapshotPixelRepository.createAndReturn({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag, snapshotId: incompleteSnapshot._id.toHexString() })
        }) as any);

        const latestSnapshot = await flagSnapshotService.getLatestSnapshot();
        expect(latestSnapshot.lastEventId).toEqual(35);
        expect(latestSnapshot.pixels).toEqual(createdPixels.slice(0, 35).map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })));
      });
    });

    describe('with previous legacy snapshot', () => {
      let createdPixels = [];
      beforeEach(async () => {
        createdPixels = await createManyPixel(35);
        await flagSnapshotRepository.createAndReturn({
          pixels: createdPixels.slice(0, 15).map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })) as any,
          lastEventId: 15,
          complete: true,
        });
      });
      it ('get snapshot when no newer', async () => {
        const snapshot = await flagSnapshotService.getLatestSnapshot();
        expect(snapshot.lastEventId).toEqual(15);
        expect(snapshot.pixels).toEqual(createdPixels.splice(0, 15).map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })));
      });
      it ('get newer snapshot when there is a newer', async () => {
        await new Promise((r) => setTimeout(r, 1));
        const snapshot = await flagSnapshotRepository.createAndReturn({
          lastEventId: 35,
          complete: true,
        });
        await Promise.all(createdPixels.map(async p => {
          await flagSnapshotPixelRepository.createAndReturn({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag, snapshotId: snapshot._id.toHexString() })
        }) as any);

        const latestSnapshot = await flagSnapshotService.getLatestSnapshot();
        expect(latestSnapshot.lastEventId).toEqual(35);
        expect(latestSnapshot.pixels).toEqual(createdPixels.map(p => ({ author: p.author, hexColor: p.hexColor, entityId: p.entityId, indexInFlag: p.indexInFlag })));
      });
    });
  });
});
