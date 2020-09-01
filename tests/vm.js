
const  Sval = require('sval');
const options = {
    // ECMA Version of the code (5 | 6 | 7 | 8 | 9 | 10 | 2015 | 2016 | 2017 | 2018 | 2019)
    ecmaVer: 2019,
    // Whether the code runs in a sandbox
    sandBox: true
};


const interpreter = new Sval(options);
const sanbox = {
    console: console,
};

const code = `class A {
    constructor(a) {
        this.a = a;
    }
    print() {
        return new Promise((resolve, rject) => {
            resolve(this.a)
        })
    }

    async printB() {
       return this.a
    }
}

exports.A  = A`

interpreter.run(code);
const instance = new interpreter.exports.A('test');
console.log('instance', instance);

(async () => {
    try {
        console.log('print', await instance.print())
        console.log('printB', await instance.printB())
    } catch (e) {
        console.log(e)
    }
})();