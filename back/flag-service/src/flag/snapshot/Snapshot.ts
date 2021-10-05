import { DatabaseObject } from 'library/database/object/DatabaseObject';
import { GetPixelDTO } from '../pixel/dto/GetPixelDTO';

export class FlagSnapshot extends DatabaseObject {
    lastEventId: number;
    pixels: GetPixelDTO[];
}
