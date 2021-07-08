import { DatabaseClientService } from "../client/service";
import { DatabaseObject } from "../object/class";

export class DatabaseRepository<T extends DatabaseObject> {

    constructor(protected dbClient: DatabaseClientService,
                protected collectionName: string) {
    }

    async createAndReturn(data: T): Promise<T> {
            data.createdAt = new Date();
            let insertOperation = await this.dbClient.getDb().collection(this.collectionName).insertOne(data);
            return insertOperation.ops[0];
    }

    async findOne(filter: Partial<T>) {
        return this.dbClient.getDb().collection(this.collectionName).findOne(filter);
    }

    async updateAndReturnOne(filter: Partial<T>, partialUpdateObject: Partial<T>) {
        let updateOperation = await this.dbClient.getDb().collection(this.collectionName).findOneAndUpdate(filter, { $set : partialUpdateObject}, {
            returnDocument: 'after'
        });
        return updateOperation.value
    }

    getCollectionName() {
        return this.collectionName;
    }
}