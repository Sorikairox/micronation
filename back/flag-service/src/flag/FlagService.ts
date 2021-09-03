import { Injectable } from '@nestjs/common';
import { Pixel } from './pixel/Pixel';
import { PixelRepository } from './pixel/PixelRepository';
import { differenceInMinutes } from 'date-fns';
import { UserAlreadyOwnAPixelError } from "./errors/UserAlreadyOwnAPixelError";
import { CooldownTimerHasNotEndedYetError } from "./errors/CooldownTimerHasNotEndedYetError";

@Injectable()
export class FlagService {
  constructor(private pixelRepository: PixelRepository) {}

  async addPixel(ownerId: string, hexColor = '#FFFFFF') {
    const pixelUserAlreadyOwn = await this.pixelRepository.findOne({
      author: ownerId,
      action: 'creation',
    });
    if (pixelUserAlreadyOwn) {
      throw new UserAlreadyOwnAPixelError();
    }
    const pixel = new Pixel(ownerId, hexColor);
    return this.pixelRepository.createAndReturn({
      action: 'creation',
      author: ownerId,
      entityId: pixel.pixId,
      data: { ...pixel },
    });
  }

  async changePixelColor(ownerId: string, pixelId: string, hexColor: string) {
    const lastUserAction = await this.pixelRepository.findLast({
      author: ownerId,
      action: 'update',
    });
    if (
      lastUserAction &&
      differenceInMinutes(lastUserAction.createdAt, new Date()) <
        Number(process.env.CHANGE_COOLDOWN)
    ) {
      throw new CooldownTimerHasNotEndedYetError();
    }
    return this.pixelRepository.createAndReturn({
      action: 'update',
      author: ownerId,
      entityId: pixelId,
      data: { hexColor },
    });
  }

  async getFlag(): Promise<Pixel[]> {
    return this.pixelRepository.getPixels();
  }

  async getFlagAtDate(date: Date): Promise<Pixel[]> {
    return this.pixelRepository.getPixelsAtDate(date);
  }

  async getOrCreateUserPixel(userId: string) {
    const pixelUserAlreadyOwn = await this.pixelRepository.findOne({
      author: userId,
      action: 'creation',
    });
    if (!pixelUserAlreadyOwn) {
      await this.addPixel(userId);
    }
    return this.pixelRepository.getUserPixel(userId);
  }
}
