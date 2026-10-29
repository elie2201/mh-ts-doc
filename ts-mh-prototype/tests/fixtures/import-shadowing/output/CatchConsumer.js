
mh.CatchConsumer = class CatchConsumer {
    static run() {
        const importedBefore = mh.Base;
        try {
            throw new Error('local');
        }
        catch (Base) {
            const caught = Base;
            console.log(caught);
        }
        const importedAfter = mh.Base;
        return {
            importedBefore,
            importedAfter
        };
    }
}
