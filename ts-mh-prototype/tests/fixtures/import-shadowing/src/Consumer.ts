import { Base } from './Base';

export class Consumer {
  static run(): object {
    const imported = Base;

    const callback = ({ Base }: { Base: object }) => Base;

    const importedAfter = Base;

    return {
      imported,
      callback,
      importedAfter
    };
  }
}
