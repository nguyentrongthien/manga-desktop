'use strict'

import {app, BrowserWindow, protocol} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer'
import helperFunctions from './helpers';
import downloader from "./downloader";
import errors from "./errors";

const isDevelopment = process.env.NODE_ENV !== 'production'
const {ipcMain} = require('electron')
const path = require('path')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    title: "Manga Desktop",
    width: 1900,
    height: 1000,
    webPreferences: {

      // Set to false to allow renderer to load images from local disk
      webSecurity: false,

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      devTools: !!process.env.WEBPACK_DEV_SERVER_URL,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // Prevent anything else from changing the title
  win.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });

  // This is so that iframe can load external resources
  win.webContents.session.webRequest.onHeadersReceived(
    {urls: ['*://*/*']},
    (details, callback) => {
      Object.keys(details.responseHeaders).filter(x => x.toLowerCase() === 'x-frame-options')
          .map(x => delete details.responseHeaders[x])

      callback({
        cancel: false,
        responseHeaders: details.responseHeaders,
      })
    },);

  // This intercepts http requests to external sources and replace the referer with their own url
  win.webContents.session.webRequest.onBeforeSendHeaders({urls: ['*://*/*']},
      (details, callback) => {
    if (details.url.startsWith(process.env.VUE_APP_API_SEFVER)) {
      details.requestHeaders['Origin'] = 'my-tools';
    } else {
      const url = new URL(details.url);
      details.requestHeaders['Origin'] = url.origin;
      if (!details.url.includes('//localhost')
          && details.requestHeaders['Referer']
          && details.requestHeaders['Referer'].includes('//localhost')) {
        details.requestHeaders['Referer'] = details.url;
      }
    }
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    win.removeMenu();
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Handle message coming from Renderer (check for output in terminal, not web dev console)
ipcMain.on('from-renderer', async (event, args) => {
  if(typeof helperFunctions[args.fn] !== "undefined") {
    try {
      let res = await helperFunctions[args.fn](args.payload);
      event.reply('from-main', { result: res, passThrough: args.passThrough});
    } catch (e) {
      event.reply('from-main', { error: errors.handle(e), passThrough: args.passThrough});
    }
  }
  else console.error('function [' + args.fn + '] is not found in helper functions.');
})

ipcMain.on('download-request', (event, payload) => {
  downloader(event, payload);
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
