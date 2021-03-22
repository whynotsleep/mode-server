const server = require('mode-server')
const path = require('path')

// 以下是快速启动模式quick:{open: true}
app = server({
  quick: { //快速模式 false需要自己手动use中间件
    open: true,
    staticSwitch: true,
    proxySwitch: true,
    routerSwitch: true
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
  proxyConfig: { //需要代理的目标对象，快速模式需要配置
    '/api': {
      target: 'https://proxyhost.com/target/url', //代理的目标地址
      referer: true, //是否代理修改请求的来源为代理地址，会修改请求头的referer,Host为本地服务器地址
      pathRewrite: { //重写
        '^/api': ''
      }
    }
  },
  router: [] //路由，快速模式需要配置
})

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
return


/**
 * ------------------ 以下是quick: false的情况，手动use中间件---------------------
 */
const StaticServer = require('mode-server/src/middleware/static')
const ProxyServer = require('mode-server/src/middleware/proxy')
const Router = require('mode-server/src/middleware/router')

const static = new StaticServer({
  dirname: __dirname
})
const proxy = new ProxyServer({
  '/api': {
    target: 'https://proxyhost.com/target/url', //代理的目标地址
    referer: true, //是否代理修改请求的来源为代理地址，会修改请求头的referer,Host为本地服务器地址
    pathRewrite: { //重写
      '^/api': ''
    }
  }
})
const router = new Router()

app.use(async (ctx, next) => {
  console.log(ctx.request.url)
  await next()
})

app.use(async (ctx, next) => {
  return await static.match(ctx, next)
})

app.use(async (ctx, next) => {
  return await proxy.match(ctx, next)
})

app.use(async (ctx, next) => {
  return await router.match(ctx, next)
})

app.router.use(/.*/, (ctx, next) => {
  ctx.response.status(404)
  ctx.response.write('404 not found')
})


app.start()