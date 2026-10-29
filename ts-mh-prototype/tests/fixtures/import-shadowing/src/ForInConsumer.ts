import { Base } from './Base';

export class ForInConsumer {
  static run(): object {
    const importedBefore = Base;

    const values: Record<string, object> = {
      first: { value: 1 },
      second: { value: 2 }
    };

    for (const Base in values) {
      console.log(Base);
    }

    const importedAfter = Base;

    return {
      importedBefore,
      importedAfter
    };
  }
}
