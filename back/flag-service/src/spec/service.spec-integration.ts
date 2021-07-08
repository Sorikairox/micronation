import { Test, TestingModule } from '@nestjs/testing';
import { FlagService } from '../service';
import { Pixel } from "../pixel/class";
import { DatabaseModule } from "library/database/module";
import { DatabaseClientService } from "library/database/client/service";
import { PixelModule } from "../pixel/module";
import { PixelRepository } from "../pixel/repository";
import { UserAlreadyOwnAPixelError } from "../errors";
import { DatabaseEvent } from "library/database/object/class";

describe('AppController', () => {
  let flagService: FlagService;
  let dbClientService: DatabaseClientService;
  let pixelRepository: PixelRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule.register(
          {
            uri: 'mongodb://127.0.0.1:27018',
            dbName: 'testDb',
          }
      ), PixelModule],
      controllers: [],
      providers: [FlagService],
    }).compile();

    flagService = app.get<FlagService>(FlagService);
    dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
    pixelRepository = app.get<PixelRepository>(PixelRepository);
    await dbClientService.connectionPromise;
    await dbClientService.getDb().collection(pixelRepository.getCollectionName()).deleteMany({});
  });

  afterAll(async () => {
    await dbClientService.client.close();
  });
  describe('addPixel',  () => {
    it('add creation event in db', async () => {
      let addedPixelEvent = await flagService.addPixel('ownerid', '#DDDDDD');
      let createdPixel = await dbClientService.getDb().collection(pixelRepository.getCollectionName()).findOne<DatabaseEvent<Pixel>>({_id: addedPixelEvent._id});
      expect(createdPixel).toBeDefined();
      expect(createdPixel.data.hexColor).toEqual('#DDDDDD');
      expect(createdPixel.action).toEqual('creation');
    });
    it('throw error if owner already own a pixel', async () => {
      await flagService.addPixel('otherownerid', '#DDDDDD');
      await expect(flagService.addPixel('otherownerid')).rejects.toThrow(UserAlreadyOwnAPixelError);
    })
  });
  describe('changePixelColor',  () => {
    it('add pixel event in db', async () => {
      let addedPixelEvent = await flagService.addPixel('ownerid', '#DDDDDD');
      await new Promise((r) => setTimeout(r, 1));
      await flagService.changePixelColor('ownerid', addedPixelEvent.entityId, '#FFFFFF');
      let events = await dbClientService.getDb().collection(pixelRepository.getCollectionName()).find<DatabaseEvent<Pixel>>({entityId: addedPixelEvent.entityId}, { sort : { createdAt : -1 }}).toArray();
      expect(events.length).toEqual(2);
      expect(events[0].action).toEqual('update');
      expect(events[0].data).toEqual({ hexColor: '#FFFFFF'});
    });

  });
});
