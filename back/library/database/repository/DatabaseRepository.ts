import { DatabaseClientService } from "../client/DatabaseClientService";
import { DatabaseObject } from "../object/DatabaseObject";
import { FilterQuery, SortOptionObject } from 'mongodb';

export class DatabaseRepository<T extends DatabaseObject> {

    constructor(protected dbClient: DatabaseClientService,
                protected collectionName: string) {
    }

    async createAndReturn(data: T): Promise<T> {
            data.createdAt = new Date();
            const insertOperation = await this.dbClient.getDb().collection(this.collectionName).insertOne(data);
            return insertOperation.ops[0];
    }

    async createMany(data: Array<T>) {
        return this.dbClient.getDb().collection(this.collectionName).insertMany(data);
    }

    async find(filter: FilterQuery<T>, sort?: SortOptionObject<T>): Promise<Array<T>> {
        const dataArray = await this.dbClient.getDb().collection(this.collectionName).find(filter).sort(sort).toArray();
        return dataArray;
    }

    async findOne(filter: FilterQuery<T>): Promise<T> {
        return this.dbClient.getDb().collection(this.collectionName).findOne(filter);
    }

    async findLastByDate(filter: FilterQuery<T>): Promise<T> {
        return this.dbClient.getDb().collection(this.collectionName).findOne(filter, { sort: { createdAt: -1 } });
    }

    async findLastByEventId(filter: FilterQuery<T>): Promise<T> {
        return this.dbClient.getDb().collection(this.collectionName).findOne(filter, { sort: { eventId: -1 } });
    }

    async updateAndReturnOne(filter: Partial<T>, partialUpdateObject: Partial<T>): Promise<T> {
        const updateOperation = await this.dbClient.getDb().collection(this.collectionName).findOneAndUpdate(filter, { $set : partialUpdateObject}, {
            returnDocument: 'after'
        });
        return updateOperation.value
    }

    getCollectionName() {
        return this.collectionName;
    }

    getCollection() {
        return this.dbClient.getDb().collection(this.collectionName);
    }
}
