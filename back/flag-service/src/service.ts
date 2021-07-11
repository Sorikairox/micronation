import { Injectable } from '@nestjs/common';
import { Pixel } from "./pixel/class";
import { PixelRepository } from "./pixel/repository";
import { CooldownTimerHasNotEndedYet, UserAlreadyOwnAPixelError } from "./errors";
import { differenceInMinutes } from 'date-fns';

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
    let lastUserAction = await this.pixelRepository.findLast({ author: ownerId, action: 'update' });
    if (lastUserAction && differenceInMinutes(lastUserAction.createdAt, new Date()) < Number(process.env.CHANGE_COOLDOWN)) {
      throw new CooldownTimerHasNotEndedYet;
    }
    return this.pixelRepository.createAndReturn({ action: 'update', author: ownerId, entityId: pixelId, data: { hexColor } });
  }

  async getFlag(): Promise<Pixel[]> {
    return this.pixelRepository.getPixels();
  }

  async getFlagAtDate(date: Date): Promise<Pixel[]> {
    return this.pixelRepository.getPixelsAtDate(date);
  }
}
