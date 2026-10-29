
mh.OrdinaryConsumer = class OrdinaryConsumer {
    static run() {
        const importedBefore = mh.Base;
        const callback = (Base) => {
            return Base;
        };
        const importedAfter = mh.Base;
        return {
            importedBefore,
            callback,
            importedAfter
        };
    }
}
