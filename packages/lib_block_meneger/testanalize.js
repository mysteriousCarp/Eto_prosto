const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const code = `function myFunc(config = {'123': 11, '333': 12, '33': {'123': [1, 2, 3, 4, 5, 6 ]}}) {
    return config;
}`;

const ast = parser.parse(code);
let configValue = null;

traverse(ast, {
    // Ищем параметры функции
    FunctionDeclaration(path) {
        path.node.params.forEach(param => {
            // Ищем паттерн присваивания (config = ...)
            if (param.type === 'AssignmentPattern' && param.left.name === 'config') {
                // Извлекаем правую часть (сам объект)
                const objectCode = generate(param.right).code;

                // Превращаем строку кода объекта в реальный JS-объект
                configValue = JSON.parse(objectCode.replace(/'/g, '"'));
                // Или через new Function для сложной структуры:
                // configValue = new Function(`return ${objectCode}`)();
            }
        });
    }
});

console.log(configValue); // { '123': 11, '333': 12 }
