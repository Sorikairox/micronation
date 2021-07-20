import { Injectable, Inject } from '@nestjs/common';
import { DatabaseRepository } from 'library/database/repository/DatabaseRepository';
import { DatabaseObject } from 'library/database/object/DatabaseObject';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';

@Injectable()
export class UserRepository extends DatabaseRepository<DatabaseObject> {
  constructor(@Inject('DATABASE_CLIENT') dbClient: DatabaseClientService) {
    super(dbClient, 'users');
  }
}
