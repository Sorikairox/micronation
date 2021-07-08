import { DatabaseClientService } from "../service";
import { Db } from "mongodb";

describe('Database Client Service', () => {
    let databaseClientService: DatabaseClientService;
    beforeAll(() => {
        databaseClientService = new DatabaseClientService({
            uri: 'mongodb://127.0.0.1:27018',
            dbName: 'testDb'
        });
    });
    afterAll(async () => {
       await databaseClientService.client.close();
    });
    it('connect to db', async () => {
        await databaseClientService.connectionPromise;
    }, 5000);
    it('getDb returns db object', async () => {
       await databaseClientService.connectionPromise;
       let db = databaseClientService.getDb();
       expect(db).toBeInstanceOf(Db);
       expect(db.databaseName).toEqual('testDb');
    });
});