import { Inject } from "@nestjs/common";
import { DatabaseClientService } from "../client/service";

export class DatabaseRepository<T> {

    constructor(@Inject('DATABASE_CLIENT') protected dbClient: DatabaseClientService,
                protected collectionName: string) {
    }

    async createAndReturn(data: T): Promise<T> {
            let insertOperation = await this.dbClient.getDb().collection(this.collectionName).insertOne(data);
            return insertOperation.ops[0];
    }
}