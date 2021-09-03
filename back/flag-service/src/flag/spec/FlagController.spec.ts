import { FlagController } from '../FlagController';
import { FlagService } from '../FlagService';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserAlreadyOwnAPixelError } from "../errors/UserAlreadyOwnAPixelError";
import { CooldownTimerHasNotEndedYetError } from "../errors/CooldownTimerHasNotEndedYetError";

describe('FlagController', () => {
  let flagController: FlagController;
  let flagService: FlagService;

  beforeAll(async () => {
    flagService = new FlagService(null);
    flagController = new FlagController(flagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addPixel', () => {
    describe('success', () => {
      let addPixelSpy;
      let res;
      beforeAll(async () => {
        addPixelSpy = jest
          .spyOn(flagService, 'addPixel')
          .mockReturnValue({ fake: true } as any);
        res = await flagController.addPixel('ownerId', '#ffffff');
      });
      it('call addPixel from service', () => {
        expect(addPixelSpy).toBeCalledTimes(1);
      });
      it('return addPixel return value', () => {
        expect(res).toEqual({ fake: true });
      });
    });
    describe('failure', () => {
      let addPixelSpy;
      let res;
      beforeAll(async () => {
        addPixelSpy = jest
          .spyOn(flagService, 'addPixel')
          .mockImplementation(() => {
            throw new UserAlreadyOwnAPixelError();
          });
        res = flagController.addPixel('ownerId', '#ffffff');
      });
      it('call addPixel from service', () => {
        expect(addPixelSpy).toBeCalledTimes(1);
      });
      it('throw BadRequestException when service throw an UserAlreadyOwnAPixel error', async () => {
        await expect(res).rejects.toThrow(BadRequestException);
      });
    });
  });
  describe('changePixelColor', () => {
    describe('success', () => {
      let changePixelColorSpy;
      let res;
      beforeAll(async () => {
        changePixelColorSpy = jest
          .spyOn(flagService, 'changePixelColor')
          .mockReturnValue({ modified: true } as any);
        res = await flagController.changePixelColor('ownerId', 'pixelId', '#DDDDDD');
      });
      it('call changePixelColor from service', () => {
        expect(changePixelColorSpy).toBeCalledTimes(1);
      })
      it('returns changePixelColor return value', () => {
        expect(res).toEqual({ modified: true });
      })
    });
    describe('failure', () => {
      let changePixelColorSpy;
      let res;
      beforeAll(async () => {
        changePixelColorSpy = jest
          .spyOn(flagService, 'changePixelColor')
          .mockImplementation(() => {
            throw new CooldownTimerHasNotEndedYetError();
          });
        res = flagController.changePixelColor('ownerId', 'pixelId', '#ffffff');
      });
      it('call changePixelColor from service', () => {
        expect(changePixelColorSpy).toBeCalledTimes(1);
      });
      it('throw BadRequestException when service throw an CooldownTimerHasNotEndedYet error', async () => {
        await expect(res).rejects.toThrow(BadRequestException);
      });
    });
  });
  describe('getFlag', () => {
    describe('success', () => {
      let getFlagSpy;
      let res;
      beforeAll(async () => {
        getFlagSpy = jest
          .spyOn(flagService, 'getFlag')
          .mockReturnValue([{ modified: true }] as any);
        res = await flagController.getFlag();
      });
      it('call getFlag from service', () => {
        expect(getFlagSpy).toBeCalledTimes(1);
      })
      it('returns getFlag return value', () => {
        expect(res).toEqual([{ modified: true }]);
      })
    });
    describe('failure', () => {
      let getFlagSpy;
      let res;
      beforeAll(async () => {
        getFlagSpy = jest
          .spyOn(flagService, 'getFlag')
          .mockImplementation(() => {
            throw new Error();
          });
        res = flagController.getFlag();
      });
      it('call getFlag from service', () => {
        expect(getFlagSpy).toBeCalledTimes(1);
      });
      it('throw InternalServerErrorException when service throw an error', async () => {
        await expect(res).rejects.toThrow(InternalServerErrorException);
      });
    });
  });
  describe('getFlagAtDate', () => {
    describe('success', () => {
      let getFlagAtDateSpy;
      let res;
      beforeAll(async () => {
        getFlagAtDateSpy = jest
          .spyOn(flagService, 'getFlagAtDate')
          .mockReturnValue([{ modified: true }] as any);
        res = await flagController.getFlagAtDate(new Date());
      });
      it('call getFlagAtDate from service', () => {
        expect(getFlagAtDateSpy).toBeCalledTimes(1);
      })
      it('returns getFlagAtDate return value', () => {
        expect(res).toEqual([{ modified: true }]);
      })
    });
    describe('failure', () => {
      let getFlagAtDateSpy;
      let res;
      beforeAll(async () => {
        getFlagAtDateSpy = jest
          .spyOn(flagService, 'getFlagAtDate')
          .mockImplementation(() => {
            throw new Error();
          });
        res = flagController.getFlagAtDate(new Date());
      });
      it('call getFlag from service', () => {
        expect(getFlagAtDateSpy).toBeCalledTimes(1);
      });
      it('throw InternalServerErrorException when service throw an error', async () => {
        await expect(res).rejects.toThrow(InternalServerErrorException);
      });
    });
  });
});
