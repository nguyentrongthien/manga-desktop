// src/preload.js

import { contextBridge, ipcRenderer } from 'electron'

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        return ipcRenderer.send(channel, data)
    },
    sendSync: (channel, data) => {
        return ipcRenderer.sendSync(channel, data)
    },
    receive: (channel, func) => {
        let validChannels = ['nameOfElectronChannel'] // <-- Array of all ipcMain Channels used in the electron
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args))
        }
    }
})