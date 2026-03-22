const parser = require('@babel/parser');
const os = require("node:os");
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const fs = require('fs')

const Project = require('./main').Project

// code is a code of function with parametres config = {x: y...}
class block extends Project
{
    constructor(config = {name: 'project', version: 1, code: ''}, basepath = os.tmpdir()) {
        super(config, basepath);
        this.code = config.code
        this.fileprefix = 'etb'
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
            console.log(result)
            return result;
        } catch (e) {
            console.log(e)
            return e;
        }
    }
    getCode()
    {
        return this.code
    }

}
module.exports = block // todo: переписать тобы код был не в конфиге а в файле + возможно копировать доп файлы + поле type
namecheck = "port"
var a = async () => {
    code = await fs.promises.readFile(`./block_code/${namecheck}code.js`, 'utf8')
    console.log(code)
    b = new block({"name":`base_${namecheck}`,"version":"1.x", "code": code})
    await b.init()
    console.log(b.getConfig(), 333)
    await b.save('./', true, `base_${namecheck}`)
    g = await block.open(`./base_${namecheck}.epkg`)
    console.log(g.getConfig())


}
a()
