export class DatabaseObject {
    _id?: string;
    createdAt?: Date;
}

export class DatabaseEvent<T> extends DatabaseObject {
    action: "creation" | "update";
    data: Partial<T>;
    author: string;
    entityId: string;
}