import { DatabaseObject } from 'library/database/object/DatabaseObject';
import { GetPixelDto } from '../pixel/dto/GetPixelDto';

export class FlagSnapshot extends DatabaseObject {
    lastEventId: number;

    /**
     * @deprecated Use SnapshotPixel collections
     */
    pixels?: GetPixelDto[];
    complete: boolean;
}
