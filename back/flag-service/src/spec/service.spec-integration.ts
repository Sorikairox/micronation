import { Test, TestingModule } from '@nestjs/testing';
import { FlagController } from '../controller';
import { FlagService } from '../service';

describe('AppController', () => {
  let appController: FlagController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FlagController],
      providers: [FlagService],
    }).compile();

    appController = app.get<FlagController>(FlagController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
