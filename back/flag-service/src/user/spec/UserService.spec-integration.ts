import { DatabaseClientService } from "library/database/client/DatabaseClientService";
import { UserService } from "../UserService";
import { UserRepository } from "../UserRepository";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "library/database/DatabaseModule";
import { UserModule } from "../UserModule";
import { User } from "../User";
import { EmailAlreadyTakenError } from "../errors/EmailAlreadyTakenError";
import { NicknameAlreadyTakenError } from "../errors/NicknameAlreadyTakenError";
import { Collection } from "mongodb";
import argon2 from "argon2";
import { EmailNotFoundError } from "../errors/EmailNotFoundError";
import { IncorrectPasswordError } from "../errors/IncorrectPasswordError";
import { JwtService } from "../jwt/JwtService";
import { UserIdNotFoundError } from "../errors/UserIdNotFoundError";

describe('UserService', () => {
  let userService: UserService;
  let jwtService: JwtService;
  let dbClientService: DatabaseClientService;
  let userRepository: UserRepository;

  let userCollection: Collection<User>;
  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.register({
          uri: process.env.DATABASE_URI,
          dbName: 'testDb',
        }),
        UserModule,
      ],
    }).compile();
    userService = app.get(UserService);
    jwtService = app.get(JwtService);
    dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
    userRepository = app.get(UserRepository);
    await dbClientService.onModuleInit();
    userCollection = dbClientService
      .getDb()
      .collection(userRepository.getCollectionName());
  });

  afterAll(async () => {
    await userCollection.deleteMany({});
    await dbClientService.client.close();
  });

  describe('register', () => {
    afterAll(async () => {
      await userCollection.deleteMany({});
    });

    it('creates a new user in db', async () => {
      const user = await userService.register('user@example.com', 'password123', 'jane');
      expect(user.password).not.toBe('password123'); // it doesn't return the password unhashed

      const userInDb = await userCollection.findOne({ _id: user._id });
      expect(userInDb).toBeDefined();
      expect(userInDb.email).toBe('user@example.com');
      expect(userInDb.password).toBe(user.password);
      expect(userInDb.nickname).toBe('jane');

      expect(await argon2.verify(userInDb.password, 'password123')).toBe(true); // it stores the password hashed in db
    });
    it('throws an EmailAlreadyTakenError when a user already exists with this email in db', async () => {
      expect(await userCollection.countDocuments({ email: 'john@example.com' })).toBe(0);

      await userService.register('john@example.com', 'password123', 'john');
      await expect(userService.register('john@example.com', 'password123', 'jack'))
        .rejects.toThrow(EmailAlreadyTakenError);

      expect(await userCollection.countDocuments({ email: 'john@example.com' })).toBe(1);
    });
    it('throws a NicknameAlreadyTakenError when a user already exists with this nickname in db', async () => {
      expect(await userCollection.countDocuments({ nickname: 'anna' })).toBe(0);

      await userService.register('anna@example.com', 'password123', 'anna');
      await expect(userService.register('anotheranna@example.com', 'password123', 'anna'))
        .rejects.toThrow(NicknameAlreadyTakenError);

      expect(await userCollection.countDocuments({ nickname: 'anna' })).toBe(1);
    });
  });

  describe('login', () => {
    let signSpy;
    let response;
    beforeAll(async () => {
      await userService.register('user@example.com', 'password123', 'jane');
      signSpy = jest.spyOn(jwtService, 'sign');
      response = await userService.login('user@example.com', 'password123');
    });
    afterAll(async () => {
      await userCollection.deleteMany({});
    });

    it('logs in the user, makes a valid jwt', async () => {
      expect(response).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('user@example.com');
      expect(response.jwt).toBeDefined();

      const payload = await jwtService.verify(response.jwt);
      expect(payload).toBeDefined();
      expect(payload.sub).toBe(response.user._id.toString());
      expect(payload.userData).toStrictEqual({
        _id: response.user._id.toString(),
        email: response.user.email,
        nickname: response.user.nickname,
        createdAt: response.user.createdAt.toISOString(),
      });
    });
    it('calls JwtService.sign once', () => {
      expect(signSpy).toBeCalledTimes(1);
    });
    it('throws an EmailNotFoundError when no user exist with this email in db', async () => {
      await expect(userService.login('doesnotexist@example.com', 'password123'))
        .rejects.toThrow(EmailNotFoundError);
    });
    it('throws an IncorrectPasswordError when the password is incorrect', async () => {
      await expect(userService.login('user@example.com', 'wrongpassword789'))
        .rejects.toThrow(IncorrectPasswordError);
    });
  });

  describe('changePassword', () => {
    afterAll(async () => {
      await userCollection.deleteMany({});
    });

    it('changes user\'s password', async () => {
      let user = await userService.register('user@example.com', 'password123', 'jane');
      user = await userService.changePassword(user._id, 'password123', 'newpassword789');
      const userInDb = await userCollection.findOne({ _id: user._id });
      expect(await argon2.verify(userInDb.password, 'password123')).toBe(false);
      expect(await argon2.verify(userInDb.password, 'newpassword789')).toBe(true);
    });
    it('throws a UserIdNotFoundError when there is no user with that id', async () => {
      await expect(userService.changePassword('0123456789ab', 'password123', 'newpassword789'))
        .rejects.toThrow(UserIdNotFoundError);
    });
    it('throws an IncorrectPasswordError when current password is incorrect', async () => {
      const user = await userService.register('john@example.com', 'password123', 'john');
      await expect(userService.changePassword(user._id, 'incorrectpassword456', 'newpassword789'))
        .rejects.toThrow(IncorrectPasswordError);
    });
  });

  describe('changeNickname', () => {
    afterAll(async () => {
      await userCollection.deleteMany({});
    });

    it('changes user\'s nickname', async () => {
      let user = await userService.register('user@example.com', 'password123', 'jane');
      user = await userService.changeNickname(user._id, 'password123', 'jane42');
      const userInDb = await userCollection.findOne({ _id: user._id });
      expect(userInDb.nickname).toBe('jane42');
    });
    it('throws a UserIdNotFoundError when there is no user with that id', async () => {
      await expect(userService.changeNickname('0123456789ab', 'password123', 'jane'))
        .rejects.toThrow(UserIdNotFoundError);
    });
    it('throws an IncorrectPasswordError when password is incorrect', async () => {
      const user = await userService.register('john@example.com', 'password123', 'john');
      await expect(userService.changeNickname(user._id, 'incorrectpassword456', 'john42'))
        .rejects.toThrow(IncorrectPasswordError);
    });
    it('throws a NicknameAlreadyTakenError when another user already has that nickname', async () => {
      await userService.register('jack@example.com', 'password123', 'jack');
      const user = await userService.register('jack2@example.com', 'password123', 'jack2');
      await expect(userService.changeNickname(user._id, 'password123', 'jack'))
        .rejects.toThrow(NicknameAlreadyTakenError);
    });
  });
});
