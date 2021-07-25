import { BadRequestException, Request } from "@nestjs/common";
import { UserController } from "../UserController";
import { UserService } from "../UserService";
import { EmailAlreadyTakenError } from "../errors/EmailAlreadyTakenError";
import { NicknameAlreadyTakenError } from "../errors/NicknameAlreadyTakenError";
import { EmailNotFoundError } from "../errors/EmailNotFoundError";
import { IncorrectPasswordError } from "../errors/IncorrectPasswordError";
import { JwtService } from "../jwt/JwtService";

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeAll(async () => {
    userService = new UserService(null, new JwtService());
    userController = new UserController(userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('register', () => {
    describe('success', () => {
      let registerSpy;
      let res;
      beforeAll(async () => {
        registerSpy = jest
          .spyOn(userService, 'register')
          .mockReturnValue({ fake: true } as any);
        res = await userController.register({
          email: 'user@example.com',
          password: 'password',
          passwordConfirmation: 'password',
          nickname: 'jane'
        });
      });
      it('calls register from service', () => {
        expect(registerSpy).toBeCalledTimes(1);
      });
      it('returns register return value', () => {
        expect(res).toStrictEqual({ success: true });
      });
    });
    describe('failure', () => {
      for (const error of [
        new EmailAlreadyTakenError(),
        new NicknameAlreadyTakenError(),
      ]) {
        describe(error.constructor.name, () => {
          let registerSpy;
          let res;
          beforeAll(async () => {
            registerSpy = jest
              .spyOn(userService, 'register')
              .mockImplementation(() => {
                throw error;
              });
            res = userController.register({
              email: 'user@example.com',
              password: 'password123',
              passwordConfirmation: 'password123',
              nickname: 'jane'
            });
          });
          it('calls register from service', () => {
            expect(registerSpy).toBeCalledTimes(1);
          });
          it('throws a BadRequestException when service throws a ' + error.constructor.name, async () => {
            await expect(res).rejects.toThrow(BadRequestException);
          });
        });
      }
    });
  });

  describe('login', () => {
    describe('success', () => {
      let loginSpy;
      let res;
      beforeAll(async () => {
        loginSpy = jest
          .spyOn(userService, 'login')
          .mockReturnValue({ fake: true } as any);
        res = await userController.login({ email: 'user@example.com', password: 'password123' });
      });
      it('calls login from service', () => {
        expect(loginSpy).toBeCalledTimes(1);
      });
      it('returns login return value', () => {
        expect(res).toStrictEqual({ fake: true });
      });
    });
    describe('failure', () => {
      for (const error of [
        new EmailNotFoundError(),
        new IncorrectPasswordError(),
      ]) {
        describe(error.constructor.name, () => {
          let loginSpy;
          let res;
          beforeAll(async () => {
            loginSpy = jest
              .spyOn(userService, 'login')
              .mockImplementation(() => {
                throw error;
              });
            res = userController.login({ email: 'user@example.com', password: 'password123' });
          });
          it('calls login from service', () => {
            expect(loginSpy).toBeCalledTimes(1);
          });
          it('throws a BadRequestException when service throws a ' + error.constructor.name, async () => {
            await expect(res).rejects.toThrow(BadRequestException);
          });
        });
      }
    });
  });

  describe('changePassword', () => {
    describe('success', () => {
      let changePasswordSpy;
      let res;
      beforeAll(async () => {
        changePasswordSpy = jest
          .spyOn(userService, 'changePassword')
          .mockReturnValue({ fake: true } as any);
        res = await userController.changePassword({ user: {} } as Request, {
          currentPassword: 'oldpassword135',
          newPassword: 'password123',
          newPasswordConfirmation: 'password123'
        });
      });
      it('calls changePassword from service', () => {
        expect(changePasswordSpy).toBeCalledTimes(1);
      });
      it('returns changePassword return value', () => {
        expect(res).toStrictEqual({ success: true });
      });
    });
    describe('failure', () => {
      describe('IncorrectPasswordError', () => {
        let changePasswordSpy;
        let res;
        beforeAll(async () => {
          changePasswordSpy = jest
            .spyOn(userService, 'changePassword')
            .mockImplementation(() => {
              throw new IncorrectPasswordError();
            });
          res = userController.changePassword({ user: {} } as Request, {
            currentPassword: 'oldpassword135',
            newPassword: 'password123',
            newPasswordConfirmation: 'password123'
          });
        });
        it('calls changePassword from service', () => {
          expect(changePasswordSpy).toBeCalledTimes(1);
        });
        it('throws a BadRequestException when service throws a IncorrectPasswordError', async () => {
          await expect(res).rejects.toThrow(BadRequestException);
        });
      });
    });
  });

  describe('changeNickname', () => {
    describe('success', () => {
      let changeNicknameSpy;
      let res;
      beforeAll(async () => {
        changeNicknameSpy = jest
          .spyOn(userService, 'changeNickname')
          .mockReturnValue({ nickname: 'jane2' } as any);
        res = await userController.changeNickname({ user: {} } as Request, {
          password: 'password123',
          newNickname: 'jane2'
        });
      });
      it('calls changeNickname from service', () => {
        expect(changeNicknameSpy).toBeCalledTimes(1);
      });
      it('returns changeNickname return value', () => {
        expect(res).toStrictEqual({ nickname: 'jane2' });
      });
    });
    describe('failure', () => {
      for (const error of [
        new IncorrectPasswordError(),
        new NicknameAlreadyTakenError(),
      ]) {
        describe(error.constructor.name, () => {
          let changeNicknameSpy;
          let res;
          beforeAll(async () => {
            changeNicknameSpy = jest
              .spyOn(userService, 'changeNickname')
              .mockImplementation(() => {
                throw error;
              });
            res = userController.changeNickname({ user: {} } as Request, {
              password: 'password123',
              newNickname: 'jane2'
            });
          });
          it('calls changeNickname from service', () => {
            expect(changeNicknameSpy).toBeCalledTimes(1);
          });
          it('throws a BadRequestException when service throws a ' + error.constructor.name, async () => {
            await expect(res).rejects.toThrow(BadRequestException);
          });
        });
      }
    });
  });
});
