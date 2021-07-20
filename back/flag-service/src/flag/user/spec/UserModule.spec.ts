import { UserModule } from "../UserModule";

let secret;
beforeAll(() => {
  secret = process.env.JWT_SECRET;
});

afterAll(() => {
  process.env.JWT_SECRET = secret;
});

describe('UserModule', () => {
  function createUserModule() {
    new UserModule();
  }

  it('should throw on undefined', () => {
    delete process.env.JWT_SECRET;
    expect(createUserModule).toThrow();
  });

  it('should throw on empty', async () => {
    process.env.JWT_SECRET = '';
    await expect(createUserModule).toThrow();
  });

  it('should throw on "changeme"', async () => {
    process.env.JWT_SECRET = 'changeme';
    await expect(createUserModule).toThrow();
  });

  it('should not throw with sane value', async () => {
    process.env.JWT_SECRET = 'rBelDaTOxeiyBDnQsChz7xA5a7XnNdDtkuqJlyirJQldY9TlBwHk5fLd34x6gpvFAupZjRXLXd6aBVj2KEOvjShQUpaFO7PNZl2vyDA2QObw6TwSXngeHsOUnP1zmony';
    expect(createUserModule).not.toThrow();
  });
});
