import { Db } from 'mongodb';
import { DatabaseClientService } from '../../client/service';
import { DatabaseRepository } from "../service";

let testCollectioName = 'testCollection';

describe('Database Repository', () => {
    let databaseClientService: DatabaseClientService;
    let databaseRepository: DatabaseRepository<any>;

    beforeAll(() => {
        databaseClientService = new DatabaseClientService({
            uri: 'mongodb://127.0.0.1:27018',
            dbName: 'testDb'
        });
        databaseRepository = new DatabaseRepository<any>(databaseClientService, testCollectioName);
    });
    afterAll(async () => {
        await databaseClientService.client.close();
    });
   describe('createAndReturn', () => {
       let res;
       let dbObject;
       beforeAll(async () => {
           let db = databaseClientService.getDb();
           await db.collection(testCollectioName).deleteMany({});
           res = await databaseRepository.createAndReturn({fakeData: true, randomId: 'bestId'});
           dbObject = await db.collection(testCollectioName).findOne({randomId: 'bestId'});
       });
       it ('create object in db', async () => {
          expect(dbObject).toBeDefined();
          expect(dbObject.randomId).toEqual('bestId');
      });
       it ('returns created object', () => {
           expect(res).toEqual(dbObject);
       })
   });
});