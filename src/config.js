const path = require('path')

let config = {
  quick: { //快速模式 false需要自己手动use中间件
    open: false,
    staticSwitch: false,
    proxySwitch: false,
    routerSwitch: false
  },
  http: {
    open: true,
    port: 3000,
    option: {}
  },
  https: {
    open: true,
    port: 3443,
    key: './key.pem', //https证书私钥
    cert: './cert.pem', //https证书
    option: {}
  },
  staticPath: __dirname, //静态资源目录，快速模式需要配置
  proxyConfig: {},
  router: [] //路由，快速模式需要配置
}

module.exports = config