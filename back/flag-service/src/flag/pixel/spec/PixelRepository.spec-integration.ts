import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { set } from 'date-fns';
import { DatabaseModule } from 'library/database/DatabaseModule';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';
import { v4 } from 'uuid';
import { Pixel } from '../Pixel';
import { PixelRepository } from '../PixelRepository';

let dbClientService: DatabaseClientService;
let pixelRepository: PixelRepository;
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
    providers: [PixelRepository],
  }).compile();
  dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
  pixelRepository = app.get<PixelRepository>(PixelRepository);
  await dbClientService.onModuleInit();
}

describe('PixelRepository', () => {

  beforeAll(async () => {
    await init();
    await clean();
  });

  afterAll(async () => {
    await app.close();
    await dbClientService.client.close();
  });


  describe(PixelRepository.prototype.createAndReturn, () => {
    describe('creation event', () => {
      let createdEvent: DatabaseEvent<Pixel>;
      beforeAll(async () => {
        const event = new DatabaseEvent()
        event.action = 'creation';
        event.author = v4();
        event.entityId = v4();
        event.data = new Pixel(event.author, `${"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)})}`, event.entityId);
        createdEvent = await pixelRepository.createAndReturn(event);
      });
      it ('increment pixelCounter by 1', async () => {
        const pixelCounter = await dbClientService.getDb().collection('counter').findOne({ name : 'pixelCounter' });
        expect(pixelCounter.counter).toEqual(1);
      });
      it ('set data.indexInFlag to pixelCounterValue', () => {
        expect(createdEvent.data.indexInFlag).toEqual(1);
      });
      it ('set eventId', async () => {
        expect(createdEvent.eventId).toEqual(1);
      });
      it ('increment eventCounter', async () => {
        const eventCounter = await dbClientService.getDb().collection('counter').findOne({ name : 'pixelEventCounter' });
        expect(eventCounter.counter).toEqual(1);
      });
    });

    describe('update event', () => {
      let createdEvent: DatabaseEvent<Pixel>;
      beforeAll(async () => {
        const event = new DatabaseEvent()
        event.action = 'update';
        event.author = v4();
        event.entityId = v4();
        event.data = new Pixel(event.author, `${"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)})}`, event.entityId);
        createdEvent = await pixelRepository.createAndReturn(event);
      });

      it ('set eventId', async () => {
        expect(createdEvent.eventId).toEqual(2);
      });
      it ('does not increment pixelCounter', async () => {
        const pixelCounter = await dbClientService.getDb().collection('counter').findOne({ name : 'pixelCounter' });
        expect(pixelCounter.counter).toEqual(1);
      });
      it ('increment eventCounter', async () => {
        const pixelCounter = await dbClientService.getDb().collection('counter').findOne({ name : 'pixelEventCounter' });
        expect(pixelCounter.counter).toEqual(2);
      });
    });
  });

  describe(PixelRepository.prototype.getPixels, () => {
    beforeAll(async () => {
      await clean();
      await dbClientService.getDb().collection(pixelRepository.getCollectionName()).insertMany([
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
          createdAt: set(new Date(), {
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
          createdAt: set(new Date(), {
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
            indexInFlag: 1,
          },
          eventId: 4,
          ignored: true,
          createdAt: set(new Date(), {
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
          createdAt: set(new Date(), {
            year: 2021,
            month: 7,
            date: 9,
            hours: 23,
            minutes: 10,
            seconds: 0,
          }),
        },
      ])
    });
    it('get all pixels state ignoring event with ignored attribute to true', async () => {
      const pixels = await pixelRepository.getPixels();
      expect(pixels).toEqual([
        {
          indexInFlag: 1,
          hexColor: '#FFFFFF',
          author: 'ownerid',
          entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015fe',
        },
        {
          indexInFlag: 2,
          hexColor: '#BBBBBB',
          author: 'otherownerid',
          entityId: 'c35a2bf6-18a6-4fd5-933b-f81faf1015ff',
        },
      ]);
    });
  });

});
