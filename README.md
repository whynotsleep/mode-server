# mode-server

一个简易配置的轻量级node服务器

A configurable lightweight Node server that supports middleware, static resources, request brokers, and route management capabilities.

+ 一个轻量级node服务器,支持中间件
+ 多个配置项包括静态资源、请求代理、路由管理
+ 可同时开启htpp和https监听

## Install
```
npm i mode-server
```

## 基础配置项
```
const server = require('mode-server')
const path = require('path')
app = server({
  quick: {
    open: true,
    staticSwitch: true,
    proxySwitch: true,
    routerSwitch: true
  },
  isQuick: false, //快速模式 false需要自己手动use中间件
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
  proxyConfig: { //需要代理的目标对象，快速模式需要配置
    '/api': {
      target: 'https://proxyhost.com/target/url', //代理的目标地址
      referer: true, //是否代理修改请求的来源为代理地址，会修改请求头的referer,Host为本地服务器地址
      pathRewrite: { //重写
        '^/api': ''
      }
    }
  },
  router: [ //路由，快速模式需要配置,下一版本的工作

  ]
})
```

## 快速启动模式quick:{open: true}:
```
app.router.use('/test', (request, response) => {
  response.body = "The request name is '/api/test'"
})
app.router.use('/getList', (request, response) => {
  response.status(200)
  response.json({
    list: [1, null, true, 'abc', '文字']
  })
})

app.router.use('/error', (request, response) => {
  response.status(500)
  response.body = 'server error...'
})

app.start()

```
## 手动use中间件,quick: false的情况,可以引入其它自由中间件
  ####  
  #### 中间件
  1. 代理中间件
  ```
    const ProxyServer = require('mode-server/src/middleware/proxy')
    const proxy = new ProxyServer({
      '/api': {
        target: '/proxyurl', 
        referer: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    })
    app.use(async (ctx, next) => {
      return await proxy.match(ctx, next)
    })
  ```
  2. 静态资源中间件
  ```
    const StaticServer = require('mode-server/src/middleware/static')
    const static = new StaticServer({
      dirname: __dirname
    })
    app.use(async (ctx, next) => {
      return await static.match(ctx, next)
    })
  ```
  3. 路由中间件
  ```
    const router = new Router()
    const Router = require('mode-server/src/middleware/router')
    app.use(async (ctx, next) => {
      return await router.match(ctx, next)
    })
  ```
```
const server = require('mode-server')
const path = require('path')
app.start()
```

## request

属性
+ url url
+ hostname 域名
+ port 端口
+ path 请求路径
+ query url上的参数
+ params body上的参数

## response

response.status() 设置返回的状态码
response.json() 设置返回的json字符串
