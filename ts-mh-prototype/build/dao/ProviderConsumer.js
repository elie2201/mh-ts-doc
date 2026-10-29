import { AbstractBase as Base } from '../AbstractBase';
import { Provider as DaoProvider } from './Provider';
import { Provider as ServiceProvider } from '../service/Provider';
export class ProviderConsumer {
    static test() {
        return [DaoProvider.source(), ServiceProvider.source()];
    }
    static testMultipleImports() {
        return [Base, DaoProvider, ServiceProvider];
    }
    static testObjectProperty() {
        return {
            Base,
            BaseClass: Base,
            BaseName: 'Base'
        };
    }
}
