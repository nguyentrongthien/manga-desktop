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
        ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
})