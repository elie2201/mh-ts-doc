import { Base } from './Base';
export class OrdinaryConsumer {
    static run() {
        const importedBefore = Base;
        const callback = (Base) => {
            return Base;
        };
        const importedAfter = Base;
        return {
            importedBefore,
            callback,
            importedAfter
        };
    }
}
