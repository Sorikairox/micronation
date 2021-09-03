import { DatabaseRepository } from 'library/database/repository/DatabaseRepository';
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

  async getUserPixel(userId: string) {
    const aggregation = this.getPixelAggregation();
    aggregation.unshift({
      $match: {
        author: userId,
      },
    });
    const result = await this.getCollection().aggregate(aggregation).toArray();
    return result[0];
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

  private getPixelAggregation(): Array<any> {
    return [
      {
        $sort: { createdAt: 1 },
      },
      {
        $group: {
          _id: '$entityId',
          pixelDetails: {
            $mergeObjects: '$data',
          },
          lastUpdate: {
            $last: '$createdAt',
          },
          createdAt: {
            $first: '$createdAt',
          },
          author: {
            $last: '$author',
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                entityId: '$_id',
                lastUpdate: '$lastUpdate',
                createdAt: '$createdAt',
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
          lastUpdate: 1,
          author: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ];
  }
}
