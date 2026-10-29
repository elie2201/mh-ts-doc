import { Base } from './Base';
export class Consumer {
    static run() {
        const imported = Base;
        const callback = ({ Base }) => Base;
        const importedAfter = Base;
        return {
            imported,
            callback,
            importedAfter
        };
    }
}
