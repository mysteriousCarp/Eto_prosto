const { contextBridge, ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {

    ipcRenderer.on('call-blockly', (event, methodName, ...args) => {
        if (window.blocklyUtils && typeof window.blocklyUtils[methodName] === 'function') {
            window.blocklyUtils[methodName](...args);
        }
    });

});

contextBridge.exposeInMainWorld('electron', {
    execute: (code) => ipcRenderer.invoke('run-script', code),
    onReadBlock: (callback) => ipcRenderer.on('trigger-read-block', (_event, ...args) => callback(...args))
});