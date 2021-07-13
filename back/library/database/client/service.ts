import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { MongoClient } from "mongodb";

@Injectable()
export class DatabaseClientService implements OnModuleInit {
  public client: MongoClient;
  public connectionPromise;
  constructor(@Inject("CONFIG_OPTIONS") private options) {
    this.client = new MongoClient(options.uri, { useUnifiedTopology: true });
  }

  async onModuleInit(): Promise<void> {
    this.client = await this.client.connect();
  }

  getDb() {
    return this.client.db(this.options.dbName);
  }
}
