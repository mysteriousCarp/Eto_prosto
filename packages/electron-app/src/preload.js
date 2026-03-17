const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.on('call-blockly', (event, methodName, ...args) => {
    console.log('Preload: пересылаю вызов', methodName, args);
    const blocklyEvent = new CustomEvent('blockly-rpc', {
        detail: {
            method: methodName,
            args: args
        }
    });
    window.dispatchEvent(blocklyEvent);
});
contextBridge.exposeInMainWorld('electron', {
    execute: (code) => ipcRenderer.invoke('run-script', code),
    onReadBlock: (callback) => ipcRenderer.on('trigger-read-block', (_event, ...args) => callback(...args)),

});