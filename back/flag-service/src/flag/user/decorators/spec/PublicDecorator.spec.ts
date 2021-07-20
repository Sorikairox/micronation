import { Public } from "../PublicDecorator";
import { Reflector } from "@nestjs/core";

describe('PublicDecorator', () => {
  const reflector = new Reflector();

  class Test {
    static defaultRoute() {
    }

    @Public()
    static publicRoute() {
    }

    @Public('/target')
    static publicRouteWithRedirection() {
    }
  }

  it('does nothing when not present', () => {
    expect(reflector.get('public', Test.defaultRoute)).toStrictEqual(undefined);
  });

  it('adds metadata without redirection', () => {
    expect(reflector.get('public', Test.publicRoute)).toStrictEqual({ redirect: undefined });
  });

  it('adds metadata with redirection', () => {
    expect(reflector.get('public', Test.publicRouteWithRedirection)).toStrictEqual({ redirect: '/target' });
  });
});
