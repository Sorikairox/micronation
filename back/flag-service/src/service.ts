import { Injectable } from '@nestjs/common';
import { Pixel } from "./pixel/class";
import { PixelRepository } from "./pixel/repository";
import { UserAlreadyOwnAPixelError } from "./errors";

@Injectable()
export class FlagService {
  constructor(private pixelRepository: PixelRepository) {

  }

  async addPixel(pixel: Pixel) {
    let pixelUserAlreadyOwn = await this.pixelRepository.findOne({ ownerId: pixel.ownerId });
    if (pixelUserAlreadyOwn) {
      throw new UserAlreadyOwnAPixelError;
    }
    return this.pixelRepository.createAndReturn(pixel);
  }
}
