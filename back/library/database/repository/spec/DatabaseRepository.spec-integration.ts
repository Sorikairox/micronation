import { DatabaseClientService } from '../../client/DatabaseClientService';
import { DatabaseRepository } from "../DatabaseRepository";
import { Db } from "mongodb";

let testCollectionName = 'testCollection';

describe('Database Repository', () => {
    let databaseClientService: DatabaseClientService;
    let databaseRepository: DatabaseRepository<any>;
    let db: Db;

    beforeAll(async () => {
        databaseClientService = new DatabaseClientService({
            uri: process.env.DATABASE_URI,
            dbName: 'testDb'
        });
        databaseRepository = new DatabaseRepository<any>(databaseClientService, testCollectionName);
        await databaseClientService.onModuleInit();
        db = databaseClientService.getDb();
    });
    beforeEach(async () => {
        await db.collection(testCollectionName).deleteMany({});
    })
    afterAll(async () => {
        await databaseClientService.client.close();
    });
   describe('createAndReturn', () => {
       let res;
       let dbObject;
       beforeAll(async () => {
           res = await databaseRepository.createAndReturn({fakeData: true, randomId: 'bestId'});
           dbObject = await db.collection(testCollectionName).findOne({randomId: 'bestId'});
       });
       it ('create object in db', async () => {
          expect(dbObject).toBeDefined();
          expect(dbObject.randomId).toEqual('bestId');
      });
       it ('set createdAt field to creation date', () => {
          expect(dbObject.createdAt).toBeInstanceOf(Date);
       });
       it ('returns created object', () => {
           expect(res).toEqual(dbObject);
       })
   });
   describe('findOne', () => {
       it('find an object based on filters', async () => {
            await db.collection(testCollectionName).insertOne({criteria1 : 'coolCriteria'});
            let obj = await databaseRepository.findOne({criteria1: 'coolCriteria'});
            expect(obj.criteria1).toEqual('coolCriteria');
       });
   });
  describe('updateAndReturnOne', () => {
    it('update an object based on filters', async () => {
      await db.collection(testCollectionName).insertOne({attributeToModify : 'initialValue'});
      let obj = await databaseRepository.updateAndReturnOne({attributeToModify: 'initialValue'}, {attributeToModify: 'newValue'});
      expect(obj.attributeToModify).toEqual('newValue');
    });
  });

  describe('find', () => {
    it('find many object based on filters', async () => {
      await db.collection(testCollectionName).insertMany([{firstObject : 'initialValue'}, {secondObject: 'whocare'}]);
      const objList = await databaseRepository.find({});
      expect(objList.length).toEqual(2);
    });
    it('find many object based on filters and sort', async () => {
      await db.collection(testCollectionName).insertMany([{firstObject : 'initialValue', index: 2}, {secondObject: 'whocare', index: 1}]);
      const objList = await databaseRepository.find({}, {index: 1});
      expect(objList.length).toEqual(2);
      expect(objList[0].index).toEqual(1);
      expect(objList[1].index).toEqual(2);
    });
    it('find many and return given fields', async () => {
      await db.collection(testCollectionName).insertMany([{value : 'initialValue', index: 2, uselessField: true}, {value: 'whocare', index: 1, uselessField: true }]);
      const objList = await databaseRepository.find({}, {index: 1}, { uselessField: 0 });
      expect(objList.length).toEqual(2);
      expect(objList[0].uselessField).toBe(undefined);
      expect(objList[0].value).toEqual('whocare');
      expect(objList[0].index).toEqual(1);
      expect(objList[1].uselessField).toBe(undefined);
    });
  });
  describe('createMany', () => {
    it('create many object', async () => {
      await databaseRepository.createMany([{firstObject : 'initialValue'}, {secondObject: 'whocare'}]);
      const objList = await db.collection(testCollectionName).find({}).toArray();
      expect(objList.length).toEqual(2);
    });
  });

});
