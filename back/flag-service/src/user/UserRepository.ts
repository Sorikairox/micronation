import { Inject, Injectable } from '@nestjs/common';
import { DatabaseRepository } from 'library/database/repository/DatabaseRepository';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { User } from "./User";

@Injectable()
export class UserRepository extends DatabaseRepository<User> {
  constructor(@Inject('DATABASE_CLIENT') dbClient: DatabaseClientService) {
    super(dbClient, 'users');
  }
}
