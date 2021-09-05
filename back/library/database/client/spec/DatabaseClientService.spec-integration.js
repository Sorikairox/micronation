"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseClientService_1 = require("../DatabaseClientService");
const mongodb_1 = require("mongodb");
describe('Database Client Service', () => {
    let databaseClientService;
    beforeAll(async () => {
        databaseClientService = new DatabaseClientService_1.DatabaseClientService({
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
        expect(db).toBeInstanceOf(mongodb_1.Db);
        expect(db.databaseName).toEqual('testDb');
    });
});
//# sourceMappingURL=DatabaseClientService.spec-integration.js.map