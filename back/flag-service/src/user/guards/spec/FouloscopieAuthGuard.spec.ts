import { FouloscopieAuthGuard } from "../FouloscopieAuthGuard";
import { ExecutionContext } from "@nestjs/common";
import { InvalidDirectusTokenError } from "../../errors/InvalidDirectusTokenError";
import * as DirectusModule from "@directus/sdk";
import { AuthToken, Directus, PartialItem, QueryOne, TypeOf, UserItem } from "@directus/sdk";
import { Reflector } from "@nestjs/core";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { Public } from "../../decorators/Public";
import { MissingDirectusTokenError } from "../../errors/MissingDirectusTokenError";

jest.mock('@directus/sdk')

const VALID_DIRECTUS_TOKEN = 'valid token';
const INVALID_DIRECTUS_TOKEN = 'invalid token';
const USER_ID_SAMPLE = 'a user id';

describe('FouloscopieAuthGuard', () => {
  const reflector = new Reflector();
  const fouloscopieAuthGuard = new FouloscopieAuthGuard(reflector);

  class Test {
    static defaultRoute() {
      //
    }

    @Public()
    static publicRoute() {
      //
    }
  }

  function mockContext(
    handler: Function,
    token?: string,
  ): ExecutionContext {
    const request: any = { headers: {} };
    if (token) request.headers.authorization = token;
    return {
      getHandler(): Function {
        return handler;
      },
      switchToHttp(): HttpArgumentsHost {
        return {
          getRequest() {
            return request;
          }
        } as HttpArgumentsHost;
      }
    } as ExecutionContext;
  }

  function testDirectusStaticAuth(handler: Function, token: string | undefined, allows: boolean, shouldCallDirectusApi: boolean, shouldPopulateRequestFields: boolean) {
    function doesNotPopulateFields(context: ExecutionContext) {
      it('does not add userId field to request', async () => {
        const userId = context.switchToHttp().getRequest().userId;
        expect(userId).not.toBeDefined();
      });
    }

    function populatesFields(context: ExecutionContext) {
      it('adds userId field to request', async () => {
        const userId = context.switchToHttp().getRequest().userId;
        expect(userId).toBeDefined();
        expect(userId).toBe(USER_ID_SAMPLE);
      });
    }

    const mockedContext = mockContext(handler, token);

    const directusConstructorSpy = jest.spyOn(DirectusModule, 'Directus');
    beforeAll(() => {
      directusConstructorSpy.mockImplementation(() => ({
        auth: {
          async static(token: AuthToken) {
            return token === VALID_DIRECTUS_TOKEN;
          },
        },
        users: {
          me: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async read(query?: QueryOne<UserItem<TypeOf<any, "directus_users">>>): Promise<PartialItem<UserItem<TypeOf<any, "directus_users">>>> {
              return { id: USER_ID_SAMPLE };
            },
          },
        },
      } as Directus<any>));
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    if (allows) {
      test('returns true', async () => {
        await expect(fouloscopieAuthGuard.canActivate(mockedContext))
          .resolves.toBe(true);
      });
    } else if (token === undefined) {
      test('throws a MissingDirectusTokenError', async () => {
        await expect(fouloscopieAuthGuard.canActivate(mockedContext))
          .rejects.toThrow(MissingDirectusTokenError);
      });
    } else {
      test('throws an InvalidDirectusTokenError', async () => {
        await expect(fouloscopieAuthGuard.canActivate(mockedContext))
          .rejects.toThrow(InvalidDirectusTokenError);
      });
    }

    if (shouldCallDirectusApi) {
      test('calls Directus api with the right url', () => {
        expect(directusConstructorSpy).toBeCalledTimes(1);
        expect(directusConstructorSpy).toBeCalledWith(process.env.DIRECTUS_URL);
      });
    } else {
      test('doesn\'t call Directus api', () => {
        expect(directusConstructorSpy).not.toBeCalled();
      });
    }

    if (shouldPopulateRequestFields) {
      populatesFields(mockedContext);
    } else {
      doesNotPopulateFields(mockedContext);
    }
  }

  describe('Default route (protected)', () => {
    describe('Allows access for valid Directus static token', () => {
      testDirectusStaticAuth(Test.defaultRoute, VALID_DIRECTUS_TOKEN, true, true, true);
    });
    describe('Denies access for invalid Directus static token', () => {
      testDirectusStaticAuth(Test.defaultRoute, INVALID_DIRECTUS_TOKEN, false, true, false);
    });
    describe('Denies access without Directus static token', () => {
      testDirectusStaticAuth(Test.defaultRoute, undefined, false, false, false);
    });
  });

  describe('Public route (unprotected)', () => {
    describe('Allows access for valid Directus static token', () => {
      testDirectusStaticAuth(Test.publicRoute, VALID_DIRECTUS_TOKEN, true, false, false);
    });
    describe('Allows access for invalid Directus static token', () => {
      testDirectusStaticAuth(Test.publicRoute, INVALID_DIRECTUS_TOKEN, true, false, false);
    });
    describe('Allows access without a Directus static token', () => {
      testDirectusStaticAuth(Test.publicRoute, undefined, true, false, false);
    });
  });
});
