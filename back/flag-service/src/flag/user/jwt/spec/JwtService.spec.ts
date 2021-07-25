import { JwtService } from "../JwtService";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

let secret;
beforeAll(() => {
  secret = process.env.JWT_SECRET;
});

afterAll(() => {
  process.env.JWT_SECRET = secret;
});

describe('JwtService', () => {
  const jwtService = new JwtService();

  beforeAll(async () => {
    process.env.JWT_SECRET = 'validvalueforsecret';
    await jwtService.onModuleInit();
  });

  describe('onModuleInit', () => {
    let jwtService;
    beforeEach(() => {
      jwtService = new JwtService();
    });

    it('should throw on undefined', async () => {
      delete process.env.JWT_SECRET;
      await expect(jwtService.onModuleInit).rejects;
    });

    it('should throw on empty', async () => {
      process.env.JWT_SECRET = '';
      await expect(jwtService.onModuleInit).rejects;
    });

    it('should throw on "changeme"', async () => {
      process.env.JWT_SECRET = 'changeme';
      await expect(jwtService.onModuleInit).rejects;
    });

    it('should not throw with sane value', async () => {
      process.env.JWT_SECRET = 'rBelDaTOxeiyBDnQsChz7xA5a7XnNdDtkuqJlyirJQldY9TlBwHk5fLd34x6gpvFAupZjRXLXd6aBVj2KEOvjShQUpaFO7PNZl2vyDA2QObw6TwSXngeHsOUnP1zmony';
      await expect(jwtService.onModuleInit).resolves;
    });
  });

  describe('sign', function () {
    let token;
    beforeAll(async () => {
      token = await jwtService.sign({ some: 'data' }, '15 days');
    });

    it('returns a non-empty string', async () => {
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it('signs with the right key', async () => {
      expect(jwt.verify(token, process.env.JWT_SECRET)).toBeTruthy();
    });

    it('outputs containing the input data', async () => {
      expect(jwt.decode(token)).toMatchObject({ some: 'data' });
    });

    it('adds jti, iat and exp standard fields', async () => {
      const payload = jwt.decode(token);
      expect(payload).toHaveProperty('jti');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
    });
  });

  describe('verify', function () {
    it('returns the right payload when valid', async () => {
      const payload = {
        jti: 'id',
        exp: Math.floor(Date.now() / 1000) + 10, // in 10s
        iat: Math.floor(Date.now() / 1000),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      await expect(jwtService.verify(token)).resolves.toStrictEqual(payload);
    });

    it('throws when token was signed with a different key', async () => {
      const token = jwt.sign({ some: 'data' }, 'not the right key');
      await expect(jwtService.verify(token)).rejects.toThrow(JsonWebTokenError);
    });

    it('throws when token has expired', async () => {
      const token = jwt.sign({
        jti: 'id',
        exp: Math.floor(Date.now() / 1000) - 1, // 1s ago
      }, process.env.JWT_SECRET);
      await expect(jwtService.verify(token)).rejects.toThrow(TokenExpiredError);
    });
  });
});
