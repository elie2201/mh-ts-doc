import { Base } from './Base';

export class OrdinaryConsumer {
  static run(): object {
    const importedBefore = Base;

    const callback = (Base: object) => {
      return Base;
    };

    const importedAfter = Base;

    return {
      importedBefore,
      callback,
      importedAfter
    };
  }
}
