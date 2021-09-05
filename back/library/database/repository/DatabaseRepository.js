"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    constructor(dbClient, collectionName) {
        this.dbClient = dbClient;
        this.collectionName = collectionName;
    }
    async createAndReturn(data) {
        data.createdAt = new Date();
        let insertOperation = await this.dbClient.getDb().collection(this.collectionName).insertOne(data);
        return insertOperation.ops[0];
    }
    async findOne(filter) {
        return this.dbClient.getDb().collection(this.collectionName).findOne(filter);
    }
    async findLast(filter) {
        return this.dbClient.getDb().collection(this.collectionName).findOne(filter, { sort: { createdAt: -1 } });
    }
    async updateAndReturnOne(filter, partialUpdateObject) {
        let updateOperation = await this.dbClient.getDb().collection(this.collectionName).findOneAndUpdate(filter, { $set: partialUpdateObject }, {
            returnDocument: 'after'
        });
        return updateOperation.value;
    }
    getCollectionName() {
        return this.collectionName;
    }
    getCollection() {
        return this.dbClient.getDb().collection(this.collectionName);
    }
}
exports.DatabaseRepository = DatabaseRepository;
//# sourceMappingURL=DatabaseRepository.js.map