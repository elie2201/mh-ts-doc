


mh.dao.ProviderConsumer = class ProviderConsumer {
    static test() {
        return [mh.dao.Provider.source(), mh.service.Provider.source()];
    }
    static testMultipleImports() {
        return [mh.AbstractBase, mh.dao.Provider, mh.service.Provider];
    }
    static testObjectProperty() {
        return {
            Base: mh.AbstractBase,
            BaseClass: mh.AbstractBase,
            BaseName: 'Base'
        };
    }
}
