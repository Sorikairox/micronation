import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { FlagSnapshotPixelService } from '../FlagSnapshotPixelService';
import { FlagSnapshotPixelRepository } from '../FlagSnapshotPixelRepository';

let flagSnapshotPixelService: FlagSnapshotPixelService;
let flagSnapshotPixelRepository: FlagSnapshotPixelRepository;
let dbClientService: DatabaseClientService;
let app : TestingModule;

async function clean() {
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
    ],
    controllers: [],
    providers: [FlagSnapshotPixelService, FlagSnapshotPixelRepository],
  }).compile();
  flagSnapshotPixelService = app.get<FlagSnapshotPixelService>(FlagSnapshotPixelService);
  flagSnapshotPixelRepository = app.get<FlagSnapshotPixelRepository>(FlagSnapshotPixelRepository);
  dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
  await dbClientService.onModuleInit();
}

describe('FlagSnapshotPixelService', () => {

  beforeAll(async () => {
    await init();
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

  describe('saveSnapshotPixels', () => {
    it('save snapshot pixel to DB', async () => {
      await flagSnapshotPixelService.saveSnapshotPixels('snapshotId', [{
        pixelData: 'data',
      } as any]);
      const savedPixels = await flagSnapshotPixelRepository.find({
        snapshotId: 'snapshotId',
      });
      expect(savedPixels.length).toEqual(1);
      expect(savedPixels[0].snapshotId).toEqual('snapshotId');
    });
  });


  describe('getSnapshotPixels', () => {
    it('get snapshot pixels from DB', async () => {
      await flagSnapshotPixelRepository.createMany([{
        snapshotId: 'snapshotId',
        entityId: 'entityId1',
        hexColor: '#FFFFFF',
        author: 'author',
        createdAt: new Date(),
        indexInFlag: 1,
      },
      {
        snapshotId: 'snapshotId',
        entityId: 'entityId2',
        hexColor: '#FFFFFF',
        author: 'author2',
        createdAt: new Date(),
        indexInFlag: 2,
      },
      {
        snapshotId: 'snapshotId2',
        entityId: 'entityId2',
        hexColor: '#FFFFFF',
        author: 'author2',
        createdAt: new Date(),
        indexInFlag: 2,
      }]);
      const snapshotPixels = await flagSnapshotPixelService.getSnapshotPixels('snapshotId');
      expect(snapshotPixels.length).toEqual(2);
      expect(snapshotPixels[0].indexInFlag).toEqual(1);
    });
  });

});
