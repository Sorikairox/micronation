import { Test, TestingModule } from '@nestjs/testing';
import { FlagService } from '../service';
import { Pixel } from '../pixel/class';
import { DatabaseModule } from 'library/database/module';
import { DatabaseClientService } from 'library/database/client/service';
import { PixelModule } from '../pixel/module';
import { PixelRepository } from '../pixel/repository';
import {
  CooldownTimerHasNotEndedYet,
  UserAlreadyOwnAPixelError,
} from '../errors';
import { DatabaseEvent } from 'library/database/object/class';
import { set } from 'date-fns';

describe('FlagService', () => {
  let flagService: FlagService;
  let dbClientService: DatabaseClientService;
  let pixelRepository: PixelRepository;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.register({
          uri: 'mongodb://127.0.0.1:27018',
          dbName: 'testDb',
        }),
        PixelModule,
      ],
      controllers: [],
      providers: [FlagService],
    }).compile();
    flagService = app.get<FlagService>(FlagService);
    dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
    pixelRepository = app.get<PixelRepository>(PixelRepository);
    await dbClientService.onModuleInit();
  });

  afterAll(async () => {
    await dbClientService.client.close();
  });

  beforeEach(async () => {
    await dbClientService
      .getDb()
      .collection(pixelRepository.getCollectionName())
      .deleteMany({});
  });
  describe('addPixel', () => {
    it('add creation event in db', async () => {
      const addedPixelEvent = await flagService.addPixel(
        'secondownerid',
        '#DDDDDD',
      );
      const createdPixel = await dbClientService
        .getDb()
        .collection(pixelRepository.getCollectionName())
        .findOne<DatabaseEvent<Pixel>>({ _id: addedPixelEvent._id });
      expect(createdPixel).toBeDefined();
      expect(createdPixel.data.hexColor).toEqual('#DDDDDD');
      expect(createdPixel.action).toEqual('creation');
    });
    it('throw error if owner already own a pixel', async () => {
      await flagService.addPixel('otherownerid', '#DDDDDD');
      await expect(flagService.addPixel('otherownerid')).rejects.toThrow(
        UserAlreadyOwnAPixelError,
      );
    });
  });

  describe('changePixelColor', () => {
    it('add pixel event in db', async () => {
      const addedPixelEvent = await flagService.addPixel('ownerid', '#DDDDDD');
      await new Promise((r) => setTimeout(r, 1));

      await flagService.changePixelColor(
        'ownerid',
        addedPixelEvent.entityId,
        '#FFFFFF',
      );
      const events = await dbClientService
        .getDb()
        .collection(pixelRepository.getCollectionName())
        .find<DatabaseEvent<Pixel>>(
          { entityId: addedPixelEvent.entityId },
          { sort: { createdAt: -1 } },
        )
        .toArray();

      expect(events.length).toEqual(2);
      expect(events[0].action).toEqual('update');
      expect(events[0].data).toEqual({ hexColor: '#FFFFFF' });
    });
    it('throw error when changing color before cooldown duration ends', async () => {
      process.env.CHANGE_COOLDOWN = '5';
      const addedPixelEvent = await flagService.addPixel('ownerid', '#DDDDDD');
      await new Promise((r) => setTimeout(r, 1));

      await flagService.changePixelColor(
        'ownerid',
        addedPixelEvent.entityId,
        '#FFFFFF',
      );

      await expect(
        flagService.changePixelColor(
          'ownerid',
          addedPixelEvent.entityId,
          '#FFFFFF',
        ),
      ).rejects.toThrow(CooldownTimerHasNotEndedYet);
    });
  });

  describe('getFlag', () => {
    it('returns last flag', async () => {
      await flagService.addPixel('ownerid', '#DDDDDD');
      await new Promise((r) => setTimeout(r, 1));
      await flagService.addPixel('secondowner', '#AAAAAA');
      await new Promise((r) => setTimeout(r, 1));
      const thirdPixelEvent = await flagService.addPixel(
        'thirdowner',
        '#FFFFFF',
      );
      await new Promise((r) => setTimeout(r, 1));
      await flagService.changePixelColor(
        'thirdowner',
        thirdPixelEvent.entityId,
        '#000000',
      );

      const flag = await flagService.getFlag();
      expect(flag.length).toEqual(3);
      expect(flag[0].hexColor).toEqual('#DDDDDD');
      expect(flag[1].hexColor).toEqual('#AAAAAA');
      expect(flag[2].hexColor).toEqual('#000000');
    });
  });

  describe('getFlagAtDate', () => {
    it('returns flag at given timestamp', async () => {
      const date = new Date();
      await dbClientService
        .getDb()
        .collection(pixelRepository.getCollectionName())
        .insertMany([
          {
            action: 'creation',
            author: 'ownerid',
            entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            data: {
              ownerId: 'ownerid',
              hexColor: '#DDDDDD',
              pixId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            },
            createdAt: set(date, {
              year: 2021,
              month: 7,
              date: 9,
              hours: 23,
              minutes: 0,
              seconds: 0,
            }),
          },
          {
            action: 'creation',
            author: 'ownerid',
            entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            data: {
              ownerId: 'ownerid',
              hexColor: '#FFFFFF',
              pixId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            },
            createdAt: set(date, {
              year: 2021,
              month: 7,
              date: 9,
              hours: 23,
              minutes: 10,
              seconds: 0,
            }),
          },
          {
            action: 'creation',
            author: 'ownerid',
            entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            data: {
              ownerId: 'ownerid',
              hexColor: '#AAAAAA',
              pixId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            },
            createdAt: set(date, {
              year: 2021,
              month: 7,
              date: 9,
              hours: 23,
              minutes: 15,
              seconds: 0,
            }),
          },
          {
            action: 'creation',
            author: 'otherownerid',
            entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015ff',
            data: {
              ownerId: 'otherownerid',
              hexColor: '#BBBBBB',
              pixId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015ff',
            },
            createdAt: set(date, {
              year: 2021,
              month: 7,
              date: 9,
              hours: 23,
              minutes: 10,
              seconds: 0,
            }),
          },
        ]);
      const flag = await flagService.getFlagAtDate(
        set(date, {
          year: 2021,
          month: 7,
          date: 9,
          hours: 23,
          minutes: 10,
          seconds: 0,
        }),
      );
      expect(flag.length).toEqual(2);
      expect(flag[0].hexColor).toEqual('#FFFFFF');
      expect(flag[1].hexColor).toEqual('#BBBBBB');
    });
  });
});
