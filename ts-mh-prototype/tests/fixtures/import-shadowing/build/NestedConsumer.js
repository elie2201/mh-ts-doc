import { Base } from './Base';
export class NestedConsumer {
    static run() {
        const outerBefore = Base;
        const callback = (Base) => {
            const innerCallback = (Base) => Base;
            return innerCallback;
        };
        const outerAfter = Base;
        return {
            outerBefore,
            callback,
            outerAfter
        };
    }
}
