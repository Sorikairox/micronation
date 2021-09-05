import { DatabaseObject } from "../DatabaseObject";
export declare class DatabaseEvent<T> extends DatabaseObject {
    action: "creation" | "update";
    data: Partial<T>;
    author: string;
    entityId: string;
}
