import { Base } from './Base';

export class CatchConsumer {
  static run(): object {
    const importedBefore = Base;

    try {
      throw new Error('local');
    } catch (Base) {
      const caught = Base;
      console.log(caught);
    }

    const importedAfter = Base;

    return {
      importedBefore,
      importedAfter
    };
  }
}
