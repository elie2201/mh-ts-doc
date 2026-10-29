import { AbstractBase as Base } from '../AbstractBase';
export class Provider extends Base {
    static send() {
        return Promise.resolve('ok');
    }
    static testReference() {
        Base.log('test');
    }
    static testReference1() {
        const Base = {
            log(message) {
                console.log(message);
            }
        };
        Base.log('local');
    }
    static source() {
        return 'dao';
    }
    static testNestedScope() {
        Base.log('outer import');
        {
            const Base = {
                log(message) {
                    console.log(message);
                }
            };
            Base.log('inner local');
        }
        Base.log('outer import again');
    }
    static testParameterShadowing(Base) {
        Base.log('parameter');
    }
    static testDestructuringShadowing() {
        const { Base } = {
            Base: {
                log(message) {
                    console.log(message);
                }
            }
        };
        Base.log('destructured local');
    }
    static testClassReference() {
        return Base;
    }
    static testPassClassAsValue() {
        const callback = (value) => value;
        return callback(Base);
    }
}
