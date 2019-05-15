// vue.config.js
module.exports = {
    devServer: {
        open: process.platform === 'darwin',
        port: 8082, // CHANGE YOUR PORT HERE!
        https: true,
        disableHostCheck: true,
        proxy: 'https://104.211.95.34:8082'
    },
}