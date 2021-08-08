import { Request } from '@nestjs/common';
import { UserController } from '../UserController';
import { UserService } from '../UserService';
import { JwtService } from '../jwt/JwtService';

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

  describe('login', () => {
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

  describe('changePassword', () => {
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

  describe('changeNickname', () => {
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
});
