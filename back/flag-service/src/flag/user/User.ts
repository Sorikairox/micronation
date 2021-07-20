import { DatabaseObject } from "library/database/object/DatabaseObject";

export class User extends DatabaseObject {
  constructor(
    public email: string,
    public password: string,
    public nickname: string,
  ) {
    super();
  }
}
