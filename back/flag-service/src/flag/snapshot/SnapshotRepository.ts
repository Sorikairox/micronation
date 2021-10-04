import { Inject } from '@nestjs/common';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { DatabaseRepository } from 'library/database/repository/DatabaseRepository';
import { FlagSnapshot } from './Snapshot';

export class FlagSnapshotRepository extends DatabaseRepository<FlagSnapshot> {
  constructor(@Inject('DATABASE_CLIENT') dbClient: DatabaseClientService) {
    super(dbClient, 'flag-snapshot');
  }

}
