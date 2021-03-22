const {
  createHttpServer,
  createHttpsServer
} = require('./createServer')
const utils = require('./utils/utils.js')
const config = require('./config.js')
const Middleware = require('./middleware')
const UrlParse = require('./middleware/urlParse')
const ProxyServer = require('./middleware/proxy')
const StaticServer = require('./middleware/static')
const Router = require('./middleware/router')
const {
  Print
} = require('./utils/print')
const print = new Print()

function setMimeType(suffix, encoding) {
  let type = utils.getMimeType(suffix, encoding)
  this.setHeader('Content-type', type)
}

function json(data) {
  this.writeHead(200, {
    'Content-Length': Buffer.byteLength(this.body),
    'Content-Type': mediaType['.josn'],
  })
  this.write(JSON.stringify(data))
}

function status(code = 200) {
  this.statusCode = code
  if (code == 404) {
    this.statusMessage = 'not Found'
  }
}

class ModeServer {
  constructor(option) {
    this.config = utils.merge(true, {}, config, option)
    utils.copyAttr(this, this.config)
    utils.bindFixedThis(this, utils)
    this.middleware = new Middleware()
    this.init()
  }

  init() {
    this.urlParse = new UrlParse()
    this.use(async (ctx, next) => {
      return await this.urlParse.format(ctx, next)
    })
    if(this.quick && this.quick.open) {
      this.quickLoad()
    }
  }

  quickLoad() {
    const {staticSwitch, proxySwitch, routerSwitch} = this.quick

    if(staticSwitch) {
      this.static = new StaticServer({
        dirname: this.staticPath
      })
      this.use(async (ctx, next) => {
        return await this.static.match(ctx, next)
      })
    }
    if(proxySwitch) {
      this.proxy = new ProxyServer(this.proxyConfig)
      this.use(async (ctx, next) => {
        return await this.proxy.match(ctx, next)
      })
    }
    if(routerSwitch) {
      this.router = new Router()
      this.use(async (ctx, next) => {
        return await this.router.match(ctx, next)
      })
    }

    this.use(async (ctx, next) => {
      ctx.response.statusCode = 404
      ctx.response.statusMessage = 'not Found'
      ctx.response.statusCode = 'The page not Found'
    })

    return this
  }

  use(fn) {
    if (!this.middleware) {
      throw new Error('Missing middleware')
    }
    this.middleware.use(fn)
    return this
  }

  exec(request, response) {
    const ctx = {
      request,
      response
    }

    utils.bindFixedThis(response, [status, json, setMimeType])

    request.on('error', err => {
      response.status(500)
      response.end(err.message)
    })

    this.middleware.handler(ctx).then(res => {
        response.end(response.body)
      })
      .catch(err => {
        print.log({type: 'error', err})
        response.status(500)
        response.end(err.message)
      })
  }

  start() {
    let {
      http,
      https
    } = this

    if (http && http.open) {
      this.httpServer = createHttpServer(http, this.exec.bind(this))
    }

    if (https && https.open) {
      this.httpsServer = createHttpsServer(https, this.exec.bind(this))
    }

    return this
  }
}

module.exports = ModeServer