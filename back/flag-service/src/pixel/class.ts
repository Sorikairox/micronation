import { DatabaseObject } from "library/database/object/class";

export class Pixel extends DatabaseObject{
    constructor(public ownerId: string, public hexColor: string) {
        super();
    }
}