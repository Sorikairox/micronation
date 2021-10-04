import { DatabaseObject } from "../DatabaseObject";

export class DatabaseEvent<T> extends DatabaseObject {
    action: "creation" | "update";
    data: Partial<T>;
    author: string;
    entityId: string;
    eventId?: number;
}
