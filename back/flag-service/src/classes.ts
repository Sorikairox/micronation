export class Coordinate {
    public x: number;
    public y: number;
}

export class Pixel {
    constructor(public ownerId: string, public coordinates: Coordinate, public hexColor: string) {}
}