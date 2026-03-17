const Blockly = require('blockly/core');
const Ru = require('blockly/msg/ru');
const libraryBlocks = require('blockly/blocks');
const {javascriptGenerator, Order } = require('blockly/javascript');
const { stringify } = require('javascript-stringify');
Blockly.setLocale(Ru)
// 3 ктгории уязвимости управление форматы
let workspace;
let categories = []
async function settingsPopup(config= {})
{
    const oldOverlay = document.querySelector('.settings-overlay');
    if (oldOverlay) oldOverlay.remove();
    return new Promise((resolve) => {
        const currentData = JSON.parse(JSON.stringify(config));

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999',
            fontFamily: 'sans-serif'
        });
        overlay.classList.add('settings-overlay');

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            width: '50%',
            maxHeight: '100vh',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        });
        modal.onclick = (e) => e.stopPropagation();

        const scrollArea = document.createElement('div');
        Object.assign(scrollArea.style, {
            padding: '20px',
            overflowY: 'auto',
            flexGrow: '1'
        });

        const buildUI = (data, container, depth = 0) => {
            for (const key in data) {
                const row = document.createElement('div');
                row.style.marginBottom = '12px';
                row.style.paddingLeft = `${depth * 20}px`;

                if (typeof data[key] === 'object' && data[key] !== null) {
                    const label = document.createElement('div');
                    label.textContent = key + ':';
                    label.style.fontWeight = 'bold';
                    label.style.color = '#555';
                    label.style.fontSize = '0.9rem';
                    row.appendChild(label);
                    container.appendChild(row);
                    buildUI(data[key], container, depth + 1);
                } else {
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';

                    const label = document.createElement('span');
                    label.textContent = key;
                    label.style.minWidth = '100px';
                    label.style.marginRight = '10px';

                    const input = document.createElement('input');
                    input.value = data[key];
                    Object.assign(input.style, {
                        flexGrow: '1',
                        padding: '6px',
                    });

                    input.oninput = (e) => {
                        const val = e.target.value;
                        const originalType = typeof data[key];

                        if (originalType === 'number') {
                            data[key] = val.trim() === '' ? 0 : Number(val);
                        } else if (originalType === 'boolean') {
                            data[key] = val.toLowerCase() === 'true';
                        } else {
                            data[key] = val;
                        }
                    };

                    row.appendChild(label);
                    row.appendChild(input);
                    container.appendChild(row);
                }
            }
        };

        buildUI(currentData, scrollArea);
        const footer = document.createElement('div');
        Object.assign(footer.style, {
            padding: '15px',
            textAlign: 'right',
            background: '#ffffff'
        });

        const btn = document.createElement('button');
        btn.textContent = 'Завершить';
        Object.assign(btn.style, {
            padding: '10px 25px',
            backgroundColor: '#000000',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
        });

        btn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(currentData);
        };

        overlay.onclick = () => {
            document.body.removeChild(overlay);
            resolve(config);
        };

        footer.appendChild(btn);
        modal.appendChild(scrollArea);
        modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}
class CustomSettingsIcon extends Blockly.icons.MutatorIcon {
    constructor(block) {
        super([], block);
    }
    async onClick() {
        const block = this.sourceBlock;
        const currentData = block.customSettings || {};
        const newData = await settingsPopup(currentData);
        if (newData) {
            block.customSettings = newData;
        }
    }
}
let toolbox = {kind: 'categoryToolbox',
    contents: []
}
function toolboxCategoryGen(config = {name: 'Enter name', types: ['controls_if'], color: '#00FF00'})
{

    return {
        "kind": "category",
        "name": config.name,
        "colour": config.color,
        "contents": config.types.map(type => ({
            "kind": "block",
            "type": type
        }))
    }
}
function updateToolbox()
{
    workspace.updateToolbox(toolbox)
}
function addBlock(name, config = {})
{
    const block = {
    init: function() {
        this.appendDummyInput().appendField(name);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(225);
        this.setMutator(new CustomSettingsIcon(this));
        this.customSettings = config;
    },
    saveExtraState: function() {
        return { 'settings': this.customSettings };
    },
    loadExtraState: function(state) {
        this.customSettings = state['settings'] || {};
    }
};

    Blockly.common.defineBlocks({ [name]: block });
    javascriptGenerator.forBlock[name] = function(block, generator) {
        const settings = block.customSettings;

        if (!settings || Object.keys(settings).length === 0) {
            return `name();\n`;
        }

        const configCode = stringify(settings);

        return `${name}(${configCode});\n`;
    };
}
function createButton(callback) {
    const button = document.createElement('button');

    Object.assign(button.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '1000',
        width: '60px',
        height: '60px',
        backgroundColor: '#333',
        border: 'none',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '0'
    });

    const triangle = document.createElement('div');

    Object.assign(triangle.style, {
        width: '0',
        height: '0',
        borderTop: '15px solid transparent',
        borderBottom: '15px solid transparent',
        borderLeft: '22px solid white',
        transform: 'rotate(0deg)',
        display: 'block'
    });
    button.appendChild(triangle);
    button.onclick = callback;

    document.body.appendChild(button);
}
function execute()
{
    const code = javascriptGenerator.workspaceToCode(workspace)
    if (window.electron)
    {
        console.log(window.electron.execute(code))
    }
    else
    {
        console.log(code)
    }
}
function addCategory(config = {name: 'Enter name', types: ['controls_if'], color: '#00FF00'})
{
    categories.push(config.name)
    toolbox.contents.push(toolboxCategoryGen(config))
    updateToolbox()
}
function categoryAddBlock(nameCategory, blockId)
{
    const index = toolbox.contents.findIndex(category => category.name === nameCategory);
    toolbox.contents[index].contents.push({
        "kind": "block",
        "type": blockId
    })
    updateToolbox()
}
function createSpecialBlocks()
{
    const checkContainer = {
        init: function() {
            this.appendDummyInput()
                .appendField('Проверка:')
                .appendField(new Blockly.FieldTextInput('check_1', (newValue) => {
                    this.syncChildNames(newValue);
                    return newValue;
                }), 'NAME');


            this.appendStatementInput('checks');


            this.appendValueInput('REPORTER_SOURCE')
                .setCheck(null)
                .appendField('результат:'); // Теперь не упадет

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(315);

            if (!this.resId) {
                this.resId = 'res_' + Blockly.utils.idGenerator.genUid().replace(/\W/g, '_');
            }

        },
        syncChildNames: function(newName) {
            if (!this.workspace) return;
            const allBlocks = this.workspace.getAllBlocks(false);
            allBlocks.forEach(block => {
                if (block.type === 'get_res' && block.sourceParentId === this.resId) {
                    block.setFieldValue(newName, 'VAR_NAME');
                }
            });
        },

        onchange: function(event) {
            if (!this.workspace || this.workspace.isDragging()) return;
            if (event.type === Blockly.Events.BLOCK_DRAG) {
                this.syncChildNames();
            }

            if (event.type === Blockly.Events.BLOCK_MOVE) {
                this.syncChildNames();
            }
            const input = this.getInput('REPORTER_SOURCE');
            if (input && !input.connection.targetBlock()) {
                const newBlock = this.workspace.newBlock('get_res');

                newBlock.sourceParentId = this.resId;

                newBlock.initSvg();
                newBlock.render();

                newBlock.sourceParent = this.id

                const currentName = this.getFieldValue('NAME');
                newBlock.setFieldValue(currentName, 'VAR_NAME');

                input.connection.connect(newBlock.outputConnection);
            }
        },
        saveExtraState: function() {
            return { 'resId': this.resId };
        },
        loadExtraState: function(state) {
            this.resId = state['resId'];
        }
    };
    const get_res = {
        init: function() {
            Object.defineProperty(this, 'parent', {
                get: function() {
                    return (this.workspace && this.sourceParent) ?
                        this.workspace.getBlockById(this.sourceParent) : null;
                },
                configurable: true
            });

            const initialName = this.parent ? this.parent.getFieldValue('NAME') : '...';

            this.appendDummyInput()
                .appendField('результат')
                .appendField(new Blockly.FieldLabel(initialName), 'VAR_NAME');

            this.setOutput(true, null);
            this.setColour(160);
            this.sourceParent = null;
            this.sourceParentId = null;
        },

        onchange: function(event) {
            if (!this.workspace || this.workspace.isDragging()) return;
            if (this.parent) {
                const name = this.parent.getFieldValue('NAME');
                if (this.getFieldValue('VAR_NAME') !== name) {
                    this.setFieldValue(name, 'VAR_NAME');
                }
            }
        },

        saveExtraState: function() {
            return {
                'sourceParentId': this.sourceParentId,
                'sourceParent': this.sourceParent
            };
        },

        loadExtraState: function(state) {
            this.sourceParentId = state['sourceParentId'];
            this.sourceParent = state['sourceParent'];
        }
    };
    const baseprint = {
        init: function() {
            this.appendValueInput('input')
                .setCheck('get_res')
                .appendField('Базовый вывод');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Выводит количество обнаруженных уязвимостей и общее количество');
            this.setHelpUrl('');
            this.setColour(225);
        }
    };

    Blockly.common.defineBlocks({get_res: get_res, checkContainer: checkContainer, baseprint: baseprint});
    javascriptGenerator.forBlock['get_res'] = function(block, generator) {
        if (block.sourceParentId)
        {
            const varName = block.sourceParentId || 'voidres';
            return [varName, generator.ORDER_ATOMIC];
        }


    };
    javascriptGenerator.forBlock['checkContainer'] = function(block, generator) {
        const firstBlock = block.getInputTargetBlock('checks');
        const blocksArray = firstBlock ? firstBlock.getDescendants(false) : [];
        const uniqueId = block.id.replace(/\W/g, '_');
        let code = `${block.resId} = [];\n`

        const codeParts = blocksArray.map(childBlock => {
            return 'a = ' + generator.blockToCode(childBlock, true) + `${block.resId}.push(a);\n`;
        });
        code += codeParts.join('');
        return code;
    }
    javascriptGenerator.forBlock['baseprint'] = function(block, generator) {
        const value_input = generator.valueToCode(block, 'input', Order.ATOMIC);
        const countname = generator.nameDB_.getDistinctName('count', 'VARIABLE');
        const itname = generator.nameDB_.getDistinctName('it', 'VARIABLE');


        const code = `${countname} = {all: ${value_input}.length, b: 0}\nfor (var ${itname} of ${value_input})\n{if (${itname}.result) {${countname}.b++;}}\nrequire('alert')(\`\${${countname}.all}\\\${${countname}.b}\` )`;
        return code;
    }
    categoryAddBlock('Управление', 'checkContainer')
    categoryAddBlock('Форматы', 'baseprint')


}
function init()
{
    createButton(execute.bind());
    workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox})


    window.blocklyUtils =
        {
            addBlock: addBlock,
            createCategory : addCategory,
            addBlockToCategory: categoryAddBlock
        }
    addCategory({name: 'Уязвимости', color: '#00FF00', types: []})
    addCategory({name: 'Управление', color: '#FF0000', types: []})
    addCategory({name: 'Форматы', color: '#003cff', types: []})
    createSpecialBlocks()
    // var testcongig = {'f': {'123': 12, '111': 2}}
    // for (var i = 0; i < 500; i++)
    // {
    //     testcongig[i.toString()] = i
    // }
    // console.log(testcongig)
    // addBlock('Уязвимость открытых портов', testcongig)
    // addBlock('Уязвимость прав доступа', testcongig)
    // categoryAddBlock('Уязвимости','Уязвимость открытых портов')
    // categoryAddBlock('Уязвимости','Уязвимость прав доступа')
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

