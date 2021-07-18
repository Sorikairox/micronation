import { DatabaseClientService } from "../DatabaseClientService";
import { Db } from "mongodb";

describe('Database Client Service', () => {
    let databaseClientService: DatabaseClientService;
    beforeAll(async () => {
        databaseClientService = new DatabaseClientService({
            uri: process.env.DATABASE_URI,
            dbName: 'testDb'
        });
        await databaseClientService.onModuleInit();
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
