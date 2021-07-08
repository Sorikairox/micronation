import { DatabaseRepository } from "library/database/repository/service";
import { Pixel } from "./class";
import { Inject } from "@nestjs/common";
import { DatabaseClientService } from "library/database/client/service";

export class PixelRepository extends DatabaseRepository<Pixel> {
    constructor(@Inject('DATABASE_CLIENT') dbClient: DatabaseClientService) {
        super(dbClient, 'pixel');
    }
}