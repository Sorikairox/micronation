import { Injectable } from '@nestjs/common';
import { Pixel } from "./pixel/class";
import { PixelRepository } from "./pixel/repository";
import { UserAlreadyOwnAPixelError } from "./errors";

@Injectable()
export class FlagService {
  constructor(private pixelRepository: PixelRepository) {

  }

  async addPixel(ownerId: string, hexColor: string = '#FFFFFF') {
    let pixelUserAlreadyOwn = await this.pixelRepository.findOne({ author: ownerId, action: 'creation' });
    if (pixelUserAlreadyOwn) {
      throw new UserAlreadyOwnAPixelError;
    }
    let pixel = new Pixel(ownerId, hexColor);
    return this.pixelRepository.createAndReturn({ action: 'creation', author: ownerId, entityId: pixel.pixId, data: { ...pixel } });
  }

  async changePixelColor(ownerId: string, pixelId: string, hexColor: string) {
    return this.pixelRepository.createAndReturn({ action: 'update', author: ownerId, entityId: pixelId, data: { hexColor } });
  }
}
