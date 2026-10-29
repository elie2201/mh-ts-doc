import { Base as ImportedBase } from './Base';

export class AliasConsumer {
  static run(): object {
    const imported = ImportedBase;

    return {
      imported
    };
  }
}
