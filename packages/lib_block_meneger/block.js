const parser = require('@babel/parser');
const os = require("node:os");
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const Project = require('./main').Project

// code is a code of function with parametres config = {x: y...}
class block extends Project
{
    constructor(config = {name: 'project', version: 1, code: ''}, basepath = os.tmpdir()) {
        super(config, basepath);
        this.code = config.code
    }
    getConfig() {
        const code = this.config.code;
        if (!code) return null;
        try {
            const ast = parser.parse(code, { sourceType: "module" });
            let result = null;
            traverse(ast, {
                Function(path) {
                    path.node.params.forEach(param => {
                        if (param.type === 'AssignmentPattern' && param.left.name === 'config') {
                            const objectCode = generate(param.right).code;
                            result = new Function(`return ${objectCode}`)();
                        }
                    });
                }
            });

            return result;
        } catch (e) {
            return e;
        }
    }

}
module.exports = block
// var a = async () => {
//     b = new block({"name":"test_block","version":"1.x", "code": "function abc(config={'par1': 123, 'par2': 112}){require('alert')('код исполнился');\n return {result:1, text: ''}}"})
//     await b.init()
//     console.log(b.getConfig())
//     await b.save('./', true, 'test_block')
//
// }
// a()
