import { Injectable } from '@nestjs/common';
import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';
import { PixelDoesNotExistError } from './errors/PixelDoesNotExistError';
import { UserHasNoPixelError } from './errors/UserHasNoPixelError';
import { GetPixelDTO } from './pixel/dto/GetPixelDTO';
import { Pixel } from './pixel/Pixel';
import { PixelRepository } from './pixel/PixelRepository';
import { differenceInMilliseconds } from 'date-fns';
import { UserAlreadyOwnsAPixelError } from "./errors/UserAlreadyOwnsAPixelError";
import { CooldownTimerHasNotEndedYetError } from "./errors/CooldownTimerHasNotEndedYetError";
import { FlagSnapshotService } from './snapshot/SnapshotService';

@Injectable()
export class FlagService {
  constructor(private pixelRepository: PixelRepository, private flagSnapshotService: FlagSnapshotService) {
  }


  async addPixel(ownerId: string, hexColor = '#FFFFFF') {
    const pixelUserAlreadyOwn = await this.pixelRepository.findOne({
      author: ownerId,
      action: 'creation',
    });
    if (pixelUserAlreadyOwn) {
      throw new UserAlreadyOwnsAPixelError();
    }
    const pixel = new Pixel(ownerId, hexColor);
    const createdEvent = await this.pixelRepository.createAndReturn({
      action: 'creation',
      author: ownerId,
      entityId: pixel.pixId,
      data: { ...pixel },
    });
    this.flagSnapshotService.createSnapshotIfEventIdMeetThreshold(createdEvent.eventId);
    return createdEvent;
  }

  async changePixelColor(ownerId: string, pixelId: string, hexColor: string) {
    const lastUserAction = await this.pixelRepository.findLastByDate({
      author: ownerId,
    });
    const lastPixelEvent = await this.pixelRepository.findLastByDate({
      entityId: pixelId,
    });
    if (!lastPixelEvent) {
      throw new PixelDoesNotExistError();
    }
    const difference = differenceInMilliseconds(new Date(), lastUserAction.createdAt);
    const changeCooldownInMilliseconds = Number(process.env.CHANGE_COOLDOWN) * 60 * 1000;
    const remainingTime = changeCooldownInMilliseconds - difference;
    if (lastUserAction.action === 'update' && remainingTime > 0) {
      throw new CooldownTimerHasNotEndedYetError(remainingTime);
    }
    const createdEvent = await this.pixelRepository.createAndReturn({
      action: 'update',
      author: ownerId,
      entityId: lastPixelEvent.entityId,
      data: { ...lastPixelEvent.data, hexColor },
    });
    this.flagSnapshotService.createSnapshotIfEventIdMeetThreshold(createdEvent.eventId);
    return createdEvent;
  }

  async checkUserIsNotOnCooldown(lastUserAction: DatabaseEvent<Pixel> | null, cooldownTimeInMs: number) {
    if (lastUserAction) {
      const timeSinceLastUserAction = differenceInMilliseconds(new Date(), lastUserAction.createdAt);
      const remainingTime = cooldownTimeInMs - timeSinceLastUserAction;
      if (lastUserAction.action === 'update' && remainingTime > 0) {
        throw new UserActionIsOnCooldownError(remainingTime);
      }
    }
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
    let userPixel = await this.pixelRepository.findLastByEventId({
      author: userId,
      action: 'creation',
    });
    if (!userPixel) {
      userPixel = await this.addPixel(userId);
    }
    return this.pixelRepository.getPixelById(userPixel.entityId);
  }
}
