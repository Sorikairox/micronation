import { Inject } from '@nestjs/common';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { DatabaseRepository } from 'library/database/repository/DatabaseRepository';
import { FlagSnapshotPixel } from './FlagSnapshotPixel';

export class FlagSnapshotPixelRepository extends DatabaseRepository<FlagSnapshotPixel> {
  constructor(@Inject('DATABASE_CLIENT') dbClient: DatabaseClientService) {
    super(dbClient, 'flag-snapshot-pixel');
  }

}
