import { FlagController } from '../controller';
import { FlagService } from '../service';
import { UserAlreadyOwnAPixelError } from '../errors';
import { BadRequestException } from '@nestjs/common';

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
});
