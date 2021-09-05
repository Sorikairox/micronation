import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { MongoClient } from "mongodb";
export declare class DatabaseClientService implements OnModuleInit, OnApplicationShutdown {
    private options;
    client: MongoClient;
    constructor(options: any);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    getDb(): import("mongodb").Db;
}
