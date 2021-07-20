import { DatabaseClientService } from "library/database/client/DatabaseClientService";
import { UserService } from "../UserService";
import { UserRepository } from "../UserRepository";
import { Test, TestingModule } from "@nestjs/testing";
import { PixelRepository } from "../../pixel/PixelRepository";
import { DatabaseModule } from "library/database/DatabaseModule";
import { UserModule } from "../UserModule";
import { User } from "../User";
import { EmailAlreadyTakenError } from "../errors/EmailAlreadyTakenError";
import { NicknameAlreadyTakenError } from "../errors/NicknameAlreadyTakenError";
import { Collection } from "mongodb";
import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { EmailNotFoundError } from "../errors/EmailNotFoundError";
import { IncorrectPasswordError } from "../errors/IncorrectPasswordError";

describe('UserService', () => {
  let userService: UserService;
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
      controllers: [],
      providers: [UserService],
    }).compile();
    userService = app.get(UserService);
    dbClientService = app.get<DatabaseClientService>('DATABASE_CLIENT');
    userRepository = app.get(PixelRepository);
    await dbClientService.onModuleInit();
    userCollection = dbClientService
      .getDb()
      .collection(userRepository.getCollectionName());
  });

  afterAll(async () => {
    await dbClientService.client.close();
  });
  beforeEach(async () => {
    await userCollection.deleteMany({});
  });

  describe('register', () => {
    it('creates a new user in db', async () => {
      const user = await userService.register('user@example.com', 'thisisasecret123', 'jane');
      expect(user.password).not.toBe('thisisasecret123'); // it doesn't return the password unhashed

      const userInDb = await userCollection.findOne({ _id: user._id });
      expect(userInDb).toBeDefined();
      expect(userInDb.email).toBe('user@example.com');
      expect(userInDb.password).toBe(user.password);
      expect(userInDb.nickname).toBe('jane');

      expect(await argon2.verify(userInDb.password, 'thisisasecret123')).toBe(true); // it stores the password hashed in db
    });
    it('throws an EmailAlreadyTakenError when a user already exists with this email in db', async () => {
      expect(await userCollection.countDocuments({ email: 'john@example.com' })).toBe(0);

      await userService.register('john@example.com', 'thisisasecret123', 'john');
      await expect(userService.register('john@example.com', 'thisisasecret123', 'jack'))
        .rejects.toThrow(EmailAlreadyTakenError);

      expect(await userCollection.countDocuments({ email: 'john@example.com' })).toBe(1);
    });
    it('throws a NicknameAlreadyTakenError when a user already exists with this nickname in db', async () => {
      expect(await userCollection.countDocuments({ nickname: 'anna' })).toBe(0);

      await userService.register('anna@example.com', 'thisisasecret123', 'anna');
      await expect(userService.register('anotheranna@example.com', 'thisisasecret123', 'anna'))
        .rejects.toThrow(NicknameAlreadyTakenError);

      expect(await userCollection.countDocuments({ nickname: 'anna' })).toBe(1);
    });
  });

  describe('login', () => {
    beforeAll(async () => {
      await userService.register('user@example.com', 'thisisasecret123', 'jane');
    });
    it('logs in the user, makes a valid jwt', async () => {
      const response = await userService.login('user@example.com', 'thisisasecret123');

      expect(response).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('user@example.com');
      expect(response.jwt).toBeDefined();

      let payload = await new Promise<JwtPayload>((resolve, reject) => jwt.verify(response.jwt, process.env.JWT_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }));
      expect(payload).toBeDefined();
      expect(payload.jti).toBeDefined();
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
      expect(payload.sub).toBe(response.user._id);
      expect(payload.userData).toStrictEqual({
        id: response.user._id,
        email: response.user.email,
        nickname: response.user.nickname,
      });
    });
    it('throws an EmailNotFoundError when no user exist with this email in db', () => {
      expect(userService.login('doesnotexist@example.com', 'thisisasecret123'))
        .rejects.toThrow(EmailNotFoundError);
    });
    it('throws an IncorrectPasswordError when the password is incorrect', () => {
      expect(userService.login('user@example.com', 'wrongpassword789'))
        .rejects.toThrow(IncorrectPasswordError);
    });
  });

  describe('changePassword', () => {
    it('changes user\'s password', async () => {
      let user = await userService.register('user@example.com', 'thisisasecret123', 'jane');
      let userInDb = await userCollection.findOne({ _id: user._id });
      expect(await argon2.verify(userInDb.password, 'thisisasecret123')).toBe(true);
      expect(await argon2.verify(userInDb.password, 'newpassword789')).toBe(false);

      user = await userService.changePassword(user._id, 'thisisasecret123', 'newpassword789');
      userInDb = await userCollection.findOne({ _id: user._id });
      expect(await argon2.verify(userInDb.password, 'thisisasecret123')).toBe(false);
      expect(await argon2.verify(userInDb.password, 'newpassword789')).toBe(true);
    });
    it('throws an IncorrectPasswordError when current password is incorrect', async () => {
      const user = await userService.register('john@example.com', 'thisisasecret123', 'john');
      expect(userService.changePassword(user._id, 'incorrectpassword456', 'newpassword789'))
        .rejects.toThrow(IncorrectPasswordError);
    });
  });

  describe('changeNickname', () => {
    it('changes user\'s nickname', async () => {
      let user = await userService.register('user@example.com', 'thisisasecret123', 'jane');
      let userInDb = await userCollection.findOne({ _id: user._id });
      expect(userInDb.nickname).toBe('jane');

      user = await userService.changeNickname(user._id, 'thisisasecret123', 'jane42');
      userInDb = await userCollection.findOne({ _id: user._id });
      expect(userInDb.nickname).toBe('jane42');
    });
    it('throws an IncorrectPasswordError when password is incorrect', async () => {
      const user = await userService.register('john@example.com', 'thisisasecret123', 'john');
      expect(userService.changeNickname(user._id, 'incorrectpassword456', 'john42'))
        .rejects.toThrow(IncorrectPasswordError);
    });
    it('throws a NicknameAlreadyTakenError when another user already has that nickname', async () => {
      await userService.register('jack@example.com', 'thisisasecret123', 'jack');
      const user = await userService.register('jack2@example.com', 'thisisasecret123', 'jack2');
      expect(userService.changeNickname(user._id, 'thisisasecret123', 'jack'))
        .rejects.toThrow(NicknameAlreadyTakenError);
    });
  });
});
