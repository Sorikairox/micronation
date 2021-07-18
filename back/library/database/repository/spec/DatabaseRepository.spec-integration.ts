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
});
