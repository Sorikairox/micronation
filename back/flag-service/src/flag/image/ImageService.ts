import { Injectable } from '@nestjs/common';
import { format, isAfter, set, sub } from 'date-fns';
import Jimp from 'jimp';
import { FlagService } from '../FlagService';
import { GetPixelDto } from '../pixel/dto/GetPixelDto';
import { mapCoordinatesToTargetRatioRectangleDistribution } from '../utils';

@Injectable()
export class ImageService {

  constructor(private flagService: FlagService) {
  }

  async generateFlagImage() {
    let actualDate = new Date();
    actualDate = set(actualDate, { year: 2021, date: 21, hours: 12 });
    while (isAfter(actualDate, new Date(2021, 10, 1))) {
      const pixels = await this.flagService.getFlagAtDate(actualDate);
      const image = await this.generateImageFromPixelArray(pixels, 131815, 1/2);
      const filename = 'flag-' + format(actualDate, 'yyyy-MM-dd') + '.png';
      await image.writeAsync('./' + filename);
      console.log('generated ' + filename);
      actualDate = sub(actualDate, { hours: 24 });
    }
  }

  generateImageFromPixelArray(pixelArray: Array<GetPixelDto>, flagTotalPixelCount: number, ratio: number, scaleFactor = 8) {
    const localIndexToPixelCoordinateMap = mapCoordinatesToTargetRatioRectangleDistribution(flagTotalPixelCount, ratio);
    const width = localIndexToPixelCoordinateMap.reduce<number>((max: number, actualCoordinate) => {
      if (max < actualCoordinate.x) {
        max = actualCoordinate.x;
      }
      return max;
    }, 0) + 1;
    const height = localIndexToPixelCoordinateMap.reduce<number>((max: number, actualCoordinate) => {
      if (max < actualCoordinate.y) {
        max = actualCoordinate.y;
      }
      return max;
    }, 0) + 1;
    const image = new Jimp(width * scaleFactor, height * scaleFactor);
    let i = 0;
    while (i < pixelArray.length) {
      const isColorValid = /^#[0-9a-f]{6}$/i.test(pixelArray[i].hexColor);
      const coordinates = localIndexToPixelCoordinateMap[i];
      let xScale = 0;
      while (xScale < scaleFactor) {
        let yScale = 0;
        while (yScale < scaleFactor) {
          image.setPixelColor(Jimp.cssColorToHex(isColorValid ? pixelArray[i].hexColor : '#FFFFFF'), coordinates.x * scaleFactor + xScale, coordinates.y * scaleFactor + yScale);
          yScale++;
        }
        xScale++;
      }
      i++;
    }
    return image;
  }
}
