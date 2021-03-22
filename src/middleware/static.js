const fs = require('fs')
const path = require('path')
const {
  Print
} = require('../utils/print')


class MSStatic {
  constructor(option = {}) {
    this.dirname = option.dirname || __dirname
  }

  async fread(response, filepath) {
    return new Promise((resolve, reject) => {
      try {
        let stat = fs.statSync(filepath)

        // 检查路径是否是文件，是就继续读取流
        if (stat.isFile()) {
          let readStream = fs.createReadStream(filepath, {
            // encoding: 'binary'
          })
          let suffix = path.extname(filepath)

          response.setMimeType(suffix)
          readStream.pipe(response)
          readStream.on('error', err => {
            Print.error(filepath + ' 读取失败!')
            reject(err)
          })
        } else {
          reject(err)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * 静态资源请求
   * @param {*} ctx 
   * @param {*} next 
   */
  async match(ctx, next) {
    let dirname = this.dirname
    let reqPath = ctx.request.path
    let [filepath] = reqPath.split('?')

    if (filepath === '/') {
      filepath = path.join(dirname, '/index.html')
    } else {
      filepath = path.join(dirname, filepath)
    }

    try {
      return await this.fread(ctx.response, filepath)
    } catch (err) {
      // console.error(err)
    }
    return await next()
  }
}

module.exports = MSStatic