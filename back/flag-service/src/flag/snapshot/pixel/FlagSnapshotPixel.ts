import { DatabaseObject } from 'library/database/object/DatabaseObject';

export class FlagSnapshotPixel extends DatabaseObject {
  entityId: string;
  hexColor: string;
  author: string;
  indexInFlag: number;
  snapshotId: string;
}
