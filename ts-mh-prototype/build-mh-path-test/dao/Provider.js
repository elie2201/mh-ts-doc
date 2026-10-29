
export class Provider extends mh.AbstractBase {
    static send() {
        return Promise.resolve('ok');
    }
    static testReference() {
        mh.AbstractBase.log('test');
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
        mh.AbstractBase.log('outer import');
        {
            const Base = {
                log(message) {
                    console.log(message);
                }
            };
            Base.log('inner local');
        }
        mh.AbstractBase.log('outer import again');
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
        return mh.AbstractBase;
    }
    static testPassClassAsValue() {
        const callback = (value) => value;
        return callback(mh.AbstractBase);
    }
}
