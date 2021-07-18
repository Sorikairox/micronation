import { DatabaseClientService } from "../DatabaseClientService";
import { Db } from "mongodb";

describe('Database Client Service', () => {
    let databaseClientService: DatabaseClientService;
    beforeAll(() => {
        databaseClientService = new DatabaseClientService({
            uri: process.env.DATABASE_URI,
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
