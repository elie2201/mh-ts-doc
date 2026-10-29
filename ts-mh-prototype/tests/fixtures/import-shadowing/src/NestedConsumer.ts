import { Base } from './Base';

export class NestedConsumer {
  static run(): object {
    const outerBefore = Base;

    const callback = (Base: object) => {
      const innerCallback = (Base: string) => Base;
      return innerCallback;
    };

    const outerAfter = Base;

    return {
      outerBefore,
      callback,
      outerAfter
    };
  }
}
