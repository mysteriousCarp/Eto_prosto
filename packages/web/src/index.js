const Blockly = require('blockly/core');
const Ru = require('blockly/msg/ru');
const libraryBlocks = require('blockly/blocks');

const WorkspaceManager = require('./core/blockly').WorkspaceManager
const createButton = require('./ui/button').createButton
const constants = require('./const')
const add_vuln_block = require('./blocks/vulnerability').addBlock
Blockly.setLocale(Ru)

require('./blocks/base_blocks')
// 3 ктгории уязвимости управление форматы


/**
 *
 * @param {WorkspaceManager} workspaceManager
 */
function execute(workspaceManager)
{
    let code = workspaceManager.compile()
    code = `async function main(){\n${code}\n}\nmain()\n`
    if (window.electron)
    {
        console.log(window.electron.execute(code))
    }
    else
    {
        console.log(code)
    }
}
/**
 *
 * @param {WorkspaceManager} workspaceManager
 */
function create_execute_callback(workspaceManager)
{
    return () => {execute(workspaceManager)}
}

function init()
{

    let workspaceManager = new WorkspaceManager()
    workspaceManager.init(constants.BLOCKLY_DIV_ID)

    createButton(create_execute_callback(workspaceManager));
    for (const [key, value] of Object.entries(constants.CATEGORIES))
    {
        workspaceManager.addCategory(value)
    }
    for (const [key, value] of Object.entries(constants.BLOCK_TYPES))

    {
        workspaceManager.addBlockToCategory(constants.getCategoryByBlockType(key).name, value.id)
    }

    var bloclyUtils = {
        addBlockToCategory: workspaceManager.addBlockToCategory.bind(workspaceManager),
        addVulnBlock: add_vuln_block,
        save: workspaceManager.save.bind(workspaceManager),
        load: workspaceManager.load.bind(workspaceManager)
    }
    window.addEventListener('blockly-rpc', (event) => {
        const { method, args } = event.detail;
        const fn = bloclyUtils?.[method];

        console.log('Web: получен вызов', method, args, 'Найдено:', !!fn);

        if (typeof fn === 'function') {
            fn(...args);
        } else {
            console.error(`Метод ${method} не найден в blocklyUtils`);
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

