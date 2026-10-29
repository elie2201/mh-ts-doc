
mh.ForInConsumer = class ForInConsumer {
    static run() {
        const importedBefore = mh.Base;
        const values = {
            first: { value: 1 },
            second: { value: 2 }
        };
        for (const Base in values) {
            console.log(Base);
        }
        const importedAfter = mh.Base;
        return {
            importedBefore,
            importedAfter
        };
    }
}
