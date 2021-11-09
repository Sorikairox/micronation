import { DatabaseObject } from 'library/database/object/DatabaseObject';
import { GetPixelDto } from '../pixel/dto/GetPixelDto';

export class FlagSnapshot extends DatabaseObject {
    lastEventId: number;
    pixels: GetPixelDto[];
}
