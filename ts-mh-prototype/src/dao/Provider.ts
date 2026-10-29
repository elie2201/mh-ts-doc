import { AbstractBase as Base } from '../AbstractBase';

export class Provider extends Base {
  static send(): Promise<string> {
    return Promise.resolve('ok');
  }

  static testReference(): void {
    Base.log('test');
  }

  static testReference1(): void {
    const Base = {
      log(message: string): void {
        console.log(message);
      }
    };

    Base.log('local');
  }

  static source(): string {
    return 'dao';
  }

  static testNestedScope(): void {
    Base.log('outer import');

    {
      const Base = {
        log(message: string): void {
          console.log(message);
        }
      };

      Base.log('inner local');
    }

    Base.log('outer import again');
  }

  static testParameterShadowing(Base: { log(message: string): void }): void {
    Base.log('parameter');
  }

  static testDestructuringShadowing(): void {
    const { Base } = {
      Base: {
        log(message: string): void {
          console.log(message);
        }
      }
    };

    Base.log('destructured local');
  }

  static testClassReference(): typeof Base {
    return Base;
  }

  static testPassClassAsValue(): typeof Base {
    const callback = (value: typeof Base): typeof Base => value;

    return callback(Base);
  }
}
