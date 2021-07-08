import { Inject } from "@nestjs/common";
import { MongoClient } from "mongodb";

export class DatabaseClientService {
    public client: MongoClient;
    public connectionPromise;
    constructor(@Inject('CONFIG_OPTIONS') private options) {
        this.client = new MongoClient(options.uri, {useUnifiedTopology: true});
        this.connectionPromise = this.connectToDb();
    }

    private connectToDb() {
        return this.client.connect().then((client) => {
            this.client = client;
        });
    }
    getDb() {
        return this.client.db(this.options.dbName);
    }
}