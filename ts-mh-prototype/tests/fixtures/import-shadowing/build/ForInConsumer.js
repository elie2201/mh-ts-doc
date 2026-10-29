import { Base } from './Base';
export class ForInConsumer {
    static run() {
        const importedBefore = Base;
        const values = {
            first: { value: 1 },
            second: { value: 2 }
        };
        for (const Base in values) {
            console.log(Base);
        }
        const importedAfter = Base;
        return {
            importedBefore,
            importedAfter
        };
    }
}
