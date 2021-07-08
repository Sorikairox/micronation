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

    getCollectionName() {
        return this.collectionName;
    }
}