const { app, BrowserWindow , Menu, MenuItem,dialog } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');
const { fork } = require('child_process');
const fs = require('fs');

const block_lib = require('lib_block_meneger')

let win;
function callBlockly(method, ...args) {
    win.webContents.send('call-blockly', method, ...args);
}
async function readBlock(path)
{
    block = await block_lib.Block.open(path)
    callBlockly('trigger-read-block',block.config.name, block.getConfig())
}
async function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
        }
    });
    const menu = new Menu()
    menu.append(new MenuItem({
        label: 'добавить блок',
        click: async () => {
            let respath;

                const { canceled, filePaths } = await dialog.showOpenDialog({
                    title: 'Выберите файл .etb',
                    buttonLabel: 'Открыть',
                    filters: [
                        { name: 'Eto Prosto Blcoks Files', extensions: ['etb'] },
                    ],
                    properties: ['openFile']
                });

                if (!canceled) {
                    respath = filePaths[0];
                    await readBlock(respath)
                }
            }

    }))
    Menu.setApplicationMenu(menu)
    win.loadFile(path.join(__dirname, '../dist/index.html'));




}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
ipcMain.handle('run-script', (event, code) => {
    const tempFile = `./temp_script${crypto.randomUUID().slice(0, 8)}.js`;
    fs.writeFileSync(tempFile, code);

    return new Promise((resolve) => {
        const child = fork(tempFile);
        child.on('message', (data) => {
            resolve(data);
            child.kill();
        });
        child.on('error', (err) => {
            resolve({ error: err.message });
        });
    });
});












































