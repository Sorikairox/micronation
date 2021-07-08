import { Test, TestingModule } from '@nestjs/testing';
import { FlagService } from '../service';
import { Pixel } from "../pixel/class";
import { DatabaseModule } from "library/database/module";
import { DatabaseClientService } from "library/database/client/service";
import { PixelModule } from "../pixel/module";
import { PixelRepository } from "../pixel/repository";
import { UserAlreadyOwnAPixelError } from "../errors";

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
    it('add pixel in db', async () => {
      let pixel = new Pixel('ownerid', '#DDDDDD');
      await flagService.addPixel(pixel);
      let createdPixel = await dbClientService.getDb().collection(pixelRepository.getCollectionName()).findOne<Pixel>(pixel);
      expect(createdPixel).toBeDefined();
      expect(createdPixel.hexColor).toEqual(pixel.hexColor);
    });
    it('throw error if owner already own a pixel', async () => {
      let firstPixel = new Pixel('otherownerid', '#DDDDDD');
      await flagService.addPixel(firstPixel);
      let secondPixel = new Pixel('otherownerid', '#AAAAAA');
      await expect(flagService.addPixel(secondPixel)).rejects.toThrow(UserAlreadyOwnAPixelError);
    })
  });
});
