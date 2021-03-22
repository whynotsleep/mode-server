const http = require('http')
const https = require('https')
const url = require('url')
const {
  isObject,
  bufferConcat,
} = require('../utils/utils')

class MSProxy {
  constructor(config) {
    this.config = isObject(config) ? config : {}
  }

  /**
   * 打开代理请求
   * @param {*} option 
   * @param {*} res 
   */
  openRequest(req, res, option) {
    return new Promise((resolve, reject) => {
      const request = (option.protocol === 'https:' ? https : http).request
      let proxyRequest = request(option, proxyResponse => {
        let data = []

        proxyResponse.on('data', (chunk) => {
          data.push(chunk)
        })
        proxyResponse.on('end', () => {
          res.body = bufferConcat(data)
          resolve()
        })
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers)
      })

      proxyRequest.end(req.body, 'binary')

      proxyRequest.on('error', (err) => {
        reject(err)
      })
    })
  }

  /**
   * 获取代理请求配置项
   * @param {*} matched 
   * @param {*} request 
   */
  parseOption(matched, request) {
    let {
      target,
      referer,
      pathRewrite
    } = matched
    let {
      url: requestUrl,
      method,
      headers
    } = request
    let targetParse = url.parse(target || '')
    let protocol = targetParse.protocol
    let host = targetParse.hostname
    let port = targetParse.port

    // 如果存在配置项，就匹配并重写url
    if (isObject(pathRewrite)) {
      let keys = Object.keys(pathRewrite)

      if (keys.length > 0) {
        keys.forEach(regStr => {
          requestUrl = requestUrl.replace(new RegExp(regStr), pathRewrite[regStr])
        })
      }
    }

    if (referer) {
      headers.host = host
      headers.referer = target + requestUrl
    }

    let options = {
      protocol,
      host,
      port,
      method,
      path: requestUrl,
      headers
    }
    return options
  }

  /**
   * 代理请求
   * @param {*} ctx 
   * @param {*} next 
   */
  async match(ctx, next) {
    let {
      request,
      response
    } = ctx
    let config = this.config
    let url = request.url

    for (let regStr in config) {
      let reg = new RegExp(regStr)

      if (reg.test(url)) {
        let option = this.parseOption(config[regStr], request)
        return await this.openRequest(request, response, option)
      }
    }

    return await next()
  }
}

module.exports = MSProxy