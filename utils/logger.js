const dateFormat = require('dateformat')

module.exports = function logger(name, message) {
    console.log(`${dateFormat(Date.now(), 'yyyy-mm-dd hh:MM:ss.l')} [${name}]: ${message}`)
}