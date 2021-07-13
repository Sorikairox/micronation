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
    it('getDb returns db object', async () => {
       const db = databaseClientService.getDb();
       expect(db).toBeInstanceOf(Db);
       expect(db.databaseName).toEqual('testDb');
    });
});