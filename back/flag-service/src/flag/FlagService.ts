import { Injectable } from '@nestjs/common';
import { UserHasNoPixel } from './errors/UserHasNoPixel';
import { GetPixelDTO } from './pixel/dto/GetPixelDTO';
import { Pixel } from './pixel/Pixel';
import { PixelRepository } from './pixel/PixelRepository';
import { differenceInMinutes } from 'date-fns';
import { UserAlreadyOwnAPixelError } from "./errors/UserAlreadyOwnAPixelError";
import { CooldownTimerHasNotEndedYetError } from "./errors/CooldownTimerHasNotEndedYetError";
import { FlagSnapshotService } from './snapshot/SnapshotService';

@Injectable()
export class FlagService {
  constructor(private pixelRepository: PixelRepository, private flagSnapshotService: FlagSnapshotService) {}


  async addPixel(ownerId: string, hexColor = '#FFFFFF') {
    const pixelUserAlreadyOwn = await this.pixelRepository.findOne({
      author: ownerId,
      action: 'creation',
    });
    if (pixelUserAlreadyOwn) {
      throw new UserAlreadyOwnAPixelError();
    }
    const pixel = new Pixel(ownerId, hexColor);
    const createdEvent =  await this.pixelRepository.createAndReturn({
      action: 'creation',
      author: ownerId,
      entityId: pixel.pixId,
      data: { ...pixel },
    });
    this.flagSnapshotService.createSnapshotIfEventIdMeetThreshold(createdEvent.eventId);
    return createdEvent;
  }

  async changePixelColor(ownerId: string, hexColor: string) {
    const lastUserAction = await this.pixelRepository.findLast({
      author: ownerId,
    });
    if (!lastUserAction) {
      throw new UserHasNoPixel();
    }
    const difference = differenceInMinutes(new Date(), lastUserAction.createdAt);
    if (
      lastUserAction.action === 'update' && difference <
        Number(process.env.CHANGE_COOLDOWN)
    ) {
      throw new CooldownTimerHasNotEndedYetError();
    }
    const createdEvent = await this.pixelRepository.createAndReturn({
      action: 'update',
      author: ownerId,
      entityId: lastUserAction.entityId,
      data: { ...lastUserAction.data, hexColor },
    });
    this.flagSnapshotService.createSnapshotIfEventIdMeetThreshold(createdEvent.eventId);
    return createdEvent;
  }

  async getFlag(): Promise<GetPixelDTO[]> {
    const latestSnapshot = await this.flagSnapshotService.getLatestSnapshot();
    if (!latestSnapshot) {
      return this.pixelRepository.getPixels();
    } else {
      const arrayPixelNotInSnapshot = await this.pixelRepository.getPixelsAfterEventId(latestSnapshot.lastEventId);
      return this.flagSnapshotService.mergeArray(latestSnapshot.pixels, arrayPixelNotInSnapshot);
    }
  }

  async getFlagAtDate(date: Date): Promise<GetPixelDTO[]> {
    return this.pixelRepository.getPixelsAtDate(date);
  }

  async getFlagAfterDate(from: Date): Promise<GetPixelDTO[]> {
    return this.pixelRepository.getPixelsAfterDate(from);
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
