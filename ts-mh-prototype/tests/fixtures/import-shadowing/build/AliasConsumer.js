import { Base as ImportedBase } from './Base';
export class AliasConsumer {
    static run() {
        const imported = ImportedBase;
        return {
            imported
        };
    }
}
