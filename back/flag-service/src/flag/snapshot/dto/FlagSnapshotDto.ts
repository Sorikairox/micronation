import { FlagSnapshotPixel } from '../pixel/FlagSnapshotPixel';

export class FlagSnapshotDto {
  lastEventId: number;
  _id: string;
  pixels: FlagSnapshotPixel[];
}
