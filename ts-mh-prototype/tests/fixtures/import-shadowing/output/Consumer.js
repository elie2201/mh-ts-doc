
mh.Consumer = class Consumer {
    static run() {
        const imported = mh.Base;
        const callback = ({ Base }) => Base;
        const importedAfter = mh.Base;
        return {
            imported,
            callback,
            importedAfter
        };
    }
}
