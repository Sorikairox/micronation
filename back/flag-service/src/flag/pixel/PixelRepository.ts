import { DatabaseRepository } from 'library/database/repository/DatabaseRepository';
import { GetPixelDto } from './dto/GetPixelDto';
import { Pixel } from './Pixel';
import { Inject, Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'library/database/client/DatabaseClientService';
import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';

@Injectable()
export class PixelRepository extends DatabaseRepository<DatabaseEvent<Pixel>> {
  constructor(@Inject('DATABASE_CLIENT') dbClient: DatabaseClientService) {
    super(dbClient, 'pixel-events');
  }

  async getPixels() {
    return this.getCollection().aggregate(this.getPixelAggregation()).toArray();
  }

  async createAndReturn(data: DatabaseEvent<Pixel>): Promise<DatabaseEvent<Pixel>> {
    if (data.action === 'creation') {
      data.data.indexInFlag = (await this.dbClient.getDb().collection('counter').findOneAndUpdate({ name: 'pixelCounter' }, { $inc: { counter: 1 } }, {
        upsert: true,
        returnDocument: 'after',
      })).value.counter;
    }
    data.eventId = (await this.dbClient.getDb().collection('counter').findOneAndUpdate({ name: 'pixelEventCounter' }, { $inc: { counter: 1 } }, {
      upsert: true,
      returnDocument: 'after',
    })).value.counter
    return super.createAndReturn(data);
  }

  async getPixelById(pixelId: string) {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: {
        entityId: pixelId,
      },
    });
    const result = await this.getCollection().aggregate(aggregation).toArray();
    return result[result.length - 1];
  }

  async getUserPixel(userId: string) {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: {
        author: userId,
      },
    });
    const result = await this.getCollection().aggregate(aggregation).toArray();
    return result[result.length - 1];
  }

  async getPixelsAtDate(date: Date) {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: {
        createdAt: { $lte: date },
      },
    });
    return this.getCollection().aggregate(aggregation).toArray();
  }

  async getPixelsBetweenEventIds(from: number, to: number): Promise<GetPixelDto[]> {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: { eventId: { $lte: to, $gt : from },
      },
    });
    return this.getCollection().aggregate(aggregation).toArray();
  }

  async getPixelsAfterEventId(eventId: number) {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: {
        eventId: { $gt: eventId },
      },
    });
    return this.getCollection().aggregate(aggregation).toArray();
  }

  async getPixelsUntilEventId(eventId: number) {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: {
        eventId: { $lte: eventId },
      },
    });
    return this.getCollection().aggregate(aggregation).toArray();
  }

  async getPixelsAfterDate(from: Date) {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: {
        createdAt: { $gte: from },
      },
    });
    return this.getCollection().aggregate(aggregation).toArray();
  }

  private getPixelAggregation(): Array<any> {
    return [
      {
        $match: {
          ignored: {
            $ne: true,
          },
        },
      },
      {
        $sort: { eventId: 1 },
      },
      {
        $group: {
          _id: '$entityId',
          pixelDetails: {
            $mergeObjects: '$data',
          },
          author: {
            $first: '$author',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                entityId: '$_id',
                author: '$author',
              },
              '$pixelDetails',
            ],
          },
        },
      },
      {
        $project: {
          entityId: 1,
          hexColor: 1,
          author: 1,
          indexInFlag: 1,
        },
      },
      {
        $sort: {
          indexInFlag: 1,
        },
      },
    ];
  }
}
