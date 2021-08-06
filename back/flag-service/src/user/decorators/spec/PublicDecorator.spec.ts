import { Public } from "../PublicDecorator";
import { Reflector } from "@nestjs/core";

describe('PublicDecorator', () => {
  const reflector = new Reflector();

  class Test {
    static defaultRoute() {
      //
    }

    @Public()
    static publicRoute() {
      //
    }
  }

  it('does nothing when not present', () => {
    expect(reflector.get('public', Test.defaultRoute)).toStrictEqual(undefined);
  });

  it('adds metadata', () => {
    expect(reflector.get('public', Test.publicRoute)).toStrictEqual(true);
  });
});
