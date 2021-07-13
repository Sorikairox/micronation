import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { MongoClient } from "mongodb";

@Injectable()
export class DatabaseClientService implements OnModuleInit, OnApplicationShutdown {
  public client: MongoClient;

  constructor(@Inject("CONFIG_OPTIONS") private options) {
    this.client = new MongoClient(options.uri, { useUnifiedTopology: true });
  }

  async onModuleInit(): Promise<void> {
    this.client = await this.client.connect();
  }

  async onApplicationShutdown() {
    await this.client.close();
  }

  getDb() {
    return this.client.db(this.options.dbName);
  }
}
