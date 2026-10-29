import { AbstractBase as Base } from '../AbstractBase';
import { Provider as DaoProvider } from './Provider';
import { Provider as ServiceProvider } from '../service/Provider';

export class ProviderConsumer {
  static test(): string[] {
    return [DaoProvider.source(), ServiceProvider.source()];
  }

  static testMultipleImports(): unknown[] {
    return [Base, DaoProvider, ServiceProvider];
  }

  static testObjectProperty(): object {
    return {
      Base,
      BaseClass: Base,
      BaseName: 'Base'
    };
  }
}
