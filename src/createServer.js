const http = require('http');
const https = require('https');
const fs = require('fs');
const {
    isFunction,
} = require('./utils/utils')
const {Print} = require('./utils/print')
const print = new Print()

function createHttpServer(config, callback) {
    isFunction(config) && (callback = config);

    const listenCallback = isFunction(config.listenCallback) ? config.listenCallback : () => {
        print.log({
            msg: 'http server is running at port ' + config.port + '...'
        })
    }
    return http.createServer(config.options, callback).listen(config.port, listenCallback);
}

function createHttpsServer(config, callback) {
    let key = ''
    let cert = ''

    if (isFunction(config)) {
        callback = config
        config = {}
    } else {
        config = config || {}
    }

    const listenCallback = isFunction(config.listenCallback) ? config.listenCallback : () => {
        print.log({
            msg: 'https server is running at port ' + config.port + '...'
        })
    }

    // 读取https证书
    try {
        if (config.key) {
            key = fs.readFileSync(config.key)
        } else {
            print.log({
                type: 'error',
                msg: 'https需要设置证书私钥key的地址'
            })
        }

        if (config.cert) {
            cert = fs.readFileSync(config.cert)
        } else {
            print.log({
                type: 'error',
                msg: 'https需要设置签名证书cert的地址'
            })
        }
    } catch (err) {
        print.log({
            type: 'error',
            msg: 'https证书读取错误'
        })
    }

    return https.createServer({
        key,
        cert,
        ...config.options
    }, callback).listen(config.port, listenCallback);
}

module.exports = {
    createHttpServer,
    createHttpsServer
}