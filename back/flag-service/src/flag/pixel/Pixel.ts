import { v4 } from 'uuid';

export class Pixel {
  constructor(
    public ownerId: string,
    public hexColor: string,
    public pixId: string = v4(),
  ) {}
}
