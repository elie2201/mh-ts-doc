
mh.ForConsumer = class ForConsumer {
    static run() {
        const importedBefore = mh.Base;
        const values = [{ value: 1 }, { value: 2 }];
        for (const Base of values) {
            console.log(Base);
        }
        const importedAfter = mh.Base;
        return {
            importedBefore,
            importedAfter
        };
    }
}
