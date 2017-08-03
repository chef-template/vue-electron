const { globalShortcut } = require('electron')
const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')

exports.closePageRefreshable = function() {
    globalShortcut.register('CmdOrCtrl+R', () => {})
    globalShortcut.register('Shift+CmdOrCtrl+R', () => {})
}

exports.closeResizeable = function(obj) {
    obj.setResizable(false)
}

exports.closeFullScreenable = function(obj) {
    obj.setFullScreenable(false)
}

exports.installExtension = function() {
    installExtension(VUEJS_DEVTOOLS).catch(console.log)
}

exports.closeMaximizable = function(obj) {
    obj.setMaximizable(false)
}

exports.closeTitleUpdated = function(obj) {
    obj.on('page-title-updated', (e) => e.preventDefault())
}