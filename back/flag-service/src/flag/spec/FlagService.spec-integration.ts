import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserHasNoPixel } from '../errors/UserHasNoPixel';
import { FlagService } from '../FlagService';
import { Pixel } from '../pixel/Pixel';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { PixelModule } from '../pixel/PixelModule';
import { PixelRepository } from '../pixel/PixelRepository';
import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';
import { set } from 'date-fns';
import { UserAlreadyOwnAPixelError } from "../errors/UserAlreadyOwnAPixelError";
import { CooldownTimerHasNotEndedYetError } from "../errors/CooldownTimerHasNotEndedYetError";
import { FlagSnapshotModule } from '../snapshot/SnapshotModule';
import { FlagSnapshotRepository } from '../snapshot/SnapshotRepository';
import { FlagSnapshotService } from '../snapshot/SnapshotService';

describe('FlagService', () => {
  let flagService: FlagService;
  let dbClientService: DatabaseClientService;
  let pixelRepository: PixelRepository;
  let flagSnapshotRepository: FlagSnapshotRepository;
  let flagSnapshotService: FlagSnapshotService;

  async function addPixelsToDb(date: Date) {
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
            indexInFlag: 1,
          },
          eventId: 1,
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
          action: 'update',
          author: 'ownerid',
          entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
          data: {
            ownerId: 'ownerid',
            hexColor: '#FFFFFF',
            pixId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            indexInFlag: 1,
          },
          eventId: 2,
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
          action: 'update',
          author: 'ownerid',
          entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
          data: {
            ownerId: 'ownerid',
            hexColor: '#AAAAAA',
            pixId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
            indexInFlag: 2,
          },
          eventId: 4,
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
            indexInFlag: 2,
          },
          eventId: 3,
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
  }

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule.register({
          uri: process.env.DATABASE_URI,
          dbName: 'testDb',
        }),
        PixelModule,
        FlagSnapshotModule,
      ],
      controllers: [],
      providers: [FlagService],
    }).compile();
    flagService = app.get<FlagService>(FlagService);
    dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
    pixelRepository = app.get<PixelRepository>(PixelRepository);
    flagSnapshotRepository = app.get<FlagSnapshotRepository>(FlagSnapshotRepository);
    flagSnapshotService = app.get<FlagSnapshotService>(FlagSnapshotService);
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
      expect(createdPixel.data.indexInFlag).toEqual(1);
      expect(createdPixel.action).toEqual('creation');
      expect(createdPixel.eventId).toEqual(1);
    });

    it('set unique index', async () => {
      const firstPixel = flagService.addPixel(
        'first',
        '#DDDDDD',
      );
      const secondPixel = flagService.addPixel(
        'second',
        '#DDDDDD',
      );
      const thirdPixel = flagService.addPixel(
        'third',
        '#DDDDDD',
      );
      const [first, second, third] = await Promise.all([firstPixel, secondPixel, thirdPixel]);
      const firstCreated = await dbClientService
        .getDb()
        .collection(pixelRepository.getCollectionName())
        .findOne<DatabaseEvent<Pixel>>({ _id: first._id });
      const secondCreated = await dbClientService
        .getDb()
        .collection(pixelRepository.getCollectionName())
        .findOne<DatabaseEvent<Pixel>>({ _id: second._id });
      const thirdCreated = await dbClientService
        .getDb()
        .collection(pixelRepository.getCollectionName())
        .findOne<DatabaseEvent<Pixel>>({ _id: third._id });
      expect([1, 2, 3]).toContain(firstCreated.data.indexInFlag);
      expect([1, 2, 3]).toContain(secondCreated.data.indexInFlag);
      expect([1, 2, 3]).toContain(thirdCreated.data.indexInFlag);
      expect(firstCreated.data.indexInFlag === secondCreated.data.indexInFlag ).toEqual(false);
      expect(firstCreated.data.indexInFlag === thirdCreated.data.indexInFlag ).toEqual(false);
      expect(thirdCreated.data.indexInFlag === secondCreated.data.indexInFlag ).toEqual(false);
    });

    it('throw error if owner already own a pixel', async () => {
      await flagService.addPixel('otherownerid', '#DDDDDD');
      await expect(flagService.addPixel('otherownerid')).rejects.toThrow(
        UserAlreadyOwnAPixelError,
      );
    });
  });


  describe('getOrCreateUserPixel', () => {
    describe('user does not have pixel', () => {
      it('create and return pixel', async () => {
        const pixel = await flagService.getOrCreateUserPixel('notOwningPixelId');
        expect(pixel.author).toEqual('notOwningPixelId');
        expect(pixel.hexColor).toEqual('#FFFFFF');
      });
    });
    describe('user has pixel', () => {
      it('return pixel', async () => {
        await flagService.addPixel(
          'randomId',
          '#DDDDDD',
        );
        const pixel = await flagService.getOrCreateUserPixel('randomId');
        expect(pixel.author).toEqual('randomId');
        expect(pixel.hexColor).toEqual('#DDDDDD');
      });
    })
  });

  describe('changePixelColor', () => {
    it('add pixel event in db', async () => {
      const addedPixelEvent = await flagService.addPixel('ownerid', '#DDDDDD');
      await new Promise((r) => setTimeout(r, 1));

      await flagService.changePixelColor('ownerid', '#FFFFFF');
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
      expect(events[0].data.hexColor).toEqual('#FFFFFF');
      expect(events[0].eventId).toEqual(2);
      expect(events[0].data.indexInFlag).toEqual(1);
    });
    it('throw error when user has no pixel', async () => {
      process.env.CHANGE_COOLDOWN = '5';

      await expect(
        flagService.changePixelColor('fakeownerid', '#FFFFFF'),
      ).rejects.toThrow(UserHasNoPixel);
    });
    it('throw error when changing color before cooldown duration ends', async () => {
      process.env.CHANGE_COOLDOWN = '5';
      await flagService.addPixel('ownerid', '#DDDDDD');
      await new Promise((r) => setTimeout(r, 1));

      await flagService.changePixelColor('ownerid', '#FFFFFF');

      await expect(
        flagService.changePixelColor('ownerid', '#FFFFFF'),
      ).rejects.toThrow(CooldownTimerHasNotEndedYetError);
    });
  });

  describe('getFlag', () => {
    describe('without snapshot', () => {
      it('returns latest flag', async () => {
        await flagService.addPixel('ownerid', '#DDDDDD');
        await new Promise((r) => setTimeout(r, 1));
        await flagService.addPixel('secondowner', '#AAAAAA');
        await new Promise((r) => setTimeout(r, 1));
        await flagService.addPixel(
          'thirdowner',
          '#FFFFFF',
        );
        await new Promise((r) => setTimeout(r, 1));
        await flagService.changePixelColor('thirdowner', '#000000');

        const flag = await flagService.getFlag();
        expect(flag.length).toEqual(3);
        expect(flag[0].hexColor).toEqual('#DDDDDD');
        expect(flag[0].indexInFlag).toEqual(1);
        expect(flag[1].hexColor).toEqual('#AAAAAA');
        expect(flag[1].indexInFlag).toEqual(2);
        expect(flag[2].hexColor).toEqual('#000000');
        expect(flag[2].indexInFlag).toEqual(3);
      });
    });
    describe('with snapshot', () => {
      it('returns latest flag', async () => {
        await flagService.addPixel('ownerid', '#DDDDDD');
        await new Promise((r) => setTimeout(r, 1));
        await flagService.addPixel('secondowner', '#AAAAAA');
        await flagSnapshotService.createSnapShot(2);
        await new Promise((r) => setTimeout(r, 1));
        await flagService.addPixel(
          'thirdowner',
          '#FFFFFF',
        );
        await new Promise((r) => setTimeout(r, 1));
        await flagService.changePixelColor('secondowner', '#000000');

        const flag = await flagService.getFlag();
        expect(flag.length).toEqual(3);
        expect(flag[0].hexColor).toEqual('#DDDDDD');
        expect(flag[0].indexInFlag).toEqual(1);
        expect(flag[1].hexColor).toEqual('#000000');
        expect(flag[1].indexInFlag).toEqual(2);
        expect(flag[2].hexColor).toEqual('#FFFFFF');
        expect(flag[2].indexInFlag).toEqual(3);
      });
    });
  });

  describe('getFlagAtDate', () => {
    it('returns flag at given timestamp', async () => {
      const date = new Date();
      await addPixelsToDb(date);
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
      expect(flag[0].indexInFlag).toEqual(1);
      expect(flag[1].hexColor).toEqual('#BBBBBB');
      expect(flag[1].indexInFlag).toEqual(2);
    });
  });

  describe('getFlagAfterDate', () => {
    it('returns flag after a given timestamp', async () => {
      const date = new Date();
      await addPixelsToDb(date);
      const flag = await flagService.getFlagAfterDate(
        set(date, {
          year: 2021,
          month: 7,
          date: 9,
          hours: 23,
          minutes: 13,
          seconds: 0,
        }),
      );
      expect(flag.length).toEqual(1);
      expect(flag[0].hexColor).toEqual('#AAAAAA');
      expect(flag[0].indexInFlag).toEqual(2);
    });
  });

});
