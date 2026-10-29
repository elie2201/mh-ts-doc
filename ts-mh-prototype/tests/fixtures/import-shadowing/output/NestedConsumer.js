
mh.NestedConsumer = class NestedConsumer {
    static run() {
        const outerBefore = mh.Base;
        const callback = (Base) => {
            const innerCallback = (Base) => Base;
            return innerCallback;
        };
        const outerAfter = mh.Base;
        return {
            outerBefore,
            callback,
            outerAfter
        };
    }
}
