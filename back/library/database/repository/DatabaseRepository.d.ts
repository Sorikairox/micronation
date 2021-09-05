import { DatabaseClientService } from "../client/DatabaseClientService";
import { DatabaseObject } from "../object/DatabaseObject";
import { FilterQuery } from "mongodb";
export declare class DatabaseRepository<T extends DatabaseObject> {
    protected dbClient: DatabaseClientService;
    protected collectionName: string;
    constructor(dbClient: DatabaseClientService, collectionName: string);
    createAndReturn(data: T): Promise<T>;
    findOne(filter: FilterQuery<T>): Promise<any>;
    findLast(filter: FilterQuery<T>): Promise<any>;
    updateAndReturnOne(filter: Partial<T>, partialUpdateObject: Partial<T>): Promise<any>;
    getCollectionName(): string;
    getCollection(): import("mongodb").Collection<any>;
}
