const client = require('webpack-hot-middleware/client')

client.subscribe((event) => {
    if (event.action === 'reload') {
        setTimeout(() => window.location.reload(), 100)
    }
})