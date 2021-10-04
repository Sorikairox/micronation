import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';
import { v4 } from 'uuid';
import { Pixel } from '../../../flag/pixel/Pixel';
import { PixelRepository } from '../../pixel/PixelRepository';
import { FlagSnapshotModule } from '../SnapshotModule';
import { FlagSnapshotRepository } from '../SnapshotRepository';
import { FlagSnapshotService } from '../SnapshotService';

let flagSnapshotService: FlagSnapshotService;
let dbClientService: DatabaseClientService;
let pixelRepository: PixelRepository;
let flagSnapshotRepository: FlagSnapshotRepository;

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
    const app: TestingModule = await Test.createTestingModule({
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
    await dbClientService.onModuleInit();
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
  });

  afterAll(async () => {
    await dbClientService.client.close();
  });

  afterEach(async () => {
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
  });

  describe('createSnapshot', () => {
    describe('when no previous snapshot', () => {
      let createdPixels = [];
      beforeAll(async () => {
        createdPixels = await createManyPixel(9);
      });
      it ('create snapshot with aggregation', async () => {
        await flagSnapshotService.createSnapShot(9);
        const snapshot = await flagSnapshotRepository.findLast({});
        expect(snapshot.lastEventId).toEqual(9);
        expect(snapshot.pixels).toEqual(createdPixels);
      });
    });
    describe('with previous snapshot', () => {
      let createdPixels = [];
      beforeAll(async () => {
        createdPixels = await createManyPixel(15);
        await flagSnapshotService.createSnapShot(15);
        createdPixels = createdPixels.concat(...(await createManyPixel(20)));
      });
      it ('creates snapshot based on previous snapshot', async () => {
        await flagSnapshotService.createSnapShot(35);
        const snapshot = await flagSnapshotRepository.findLast({});
        expect(snapshot.lastEventId).toEqual(35);
        expect(snapshot.pixels).toEqual(createdPixels);
      });
    });
  });
});
