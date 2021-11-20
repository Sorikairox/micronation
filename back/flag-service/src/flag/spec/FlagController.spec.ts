import { ChangePixelColorDto } from '../dto/ChangePixelColorDto';
import { UserHasNoPixelError } from '../errors/UserHasNoPixelError';
import { FlagController } from '../FlagController';
import { FlagService } from '../FlagService';
import { InternalServerErrorException } from '@nestjs/common';
import { UserAlreadyOwnsAPixelError } from "../errors/UserAlreadyOwnsAPixelError";
import { UserActionIsOnCooldownError } from "../errors/UserActionIsOnCooldownError";

describe('FlagController', () => {
  let flagController: FlagController;
  let flagService: FlagService;

  beforeAll(async () => {
    flagService = new FlagService(null, null);
    flagController = new FlagController(flagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      it('throws InternalServerErrorException when service throw an error', async () => {
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
      it('throws InternalServerErrorException when service throw an error', async () => {
        await expect(res).rejects.toThrow(InternalServerErrorException);
      });
    });
  });
  describe('getUserPixel', () => {
    describe('success', () => {
      let getPixelSpy;
      let res;
      beforeAll(async () => {
        getPixelSpy = jest
          .spyOn(flagService, 'getUserPixel')
          .mockReturnValue({ pixel: true } as any);
        res = await flagController.getUserPixel('ownerId');
      });
      it('call getPixel from service', () => {
        expect(getPixelSpy).toBeCalledTimes(1);
      })
      it('returns getPixel return value', () => {
        expect(res).toEqual({ pixel: true });
      })
    });
  });
  describe('getCoolDown', () => {
    describe('success', () => {
      it('returns process.env.CHANGE_COOLDOWN', () => {
        process.env.CHANGE_COOLDOWN = '15';
        expect(flagController.getChangeCooldown().cooldown).toEqual(15);
      })
    });
  });
});
