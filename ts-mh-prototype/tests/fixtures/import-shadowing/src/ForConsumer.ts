import { Base } from './Base';

export class ForConsumer {
  static run(): object {
    const importedBefore = Base;

    const values: object[] = [{ value: 1 }, { value: 2 }];

    for (const Base of values) {
      console.log(Base);
    }

    const importedAfter = Base;

    return {
      importedBefore,
      importedAfter
    };
  }
}
