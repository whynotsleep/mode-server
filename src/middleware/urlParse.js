const url = require('url')
const utils = require('../utils/utils')
class UrlParse {
    /**
     * 接收请求数据
     * @param {*} request 
     */
    accept(request) {
        return new Promise((resolve, reject) => {
            let data = []

            request.on('data', chunk => {
                data.push(chunk)
            })
            request.on('end', () => {
                resolve(utils.bufferConcat(data))
            })
            request.on('error', (err) => {
                reject(err)
            })
        })
    }

    /**
     * 格式化请求参数
     * @param {*} ctx 
     * @param {*} next 
     */
    async format(ctx, next) {
        let request = ctx.request
        let urlObj = url.parse(request.url, true)

        try {
            for (let k in urlObj) {
                if (urlObj.hasOwnProperty(k)) {
                    request[k] = urlObj[k]
                }
            }

            let data = await this.accept(ctx.request)

            request.body = data
            request.params = utils.jsonParse(data)
            return await next()
        } catch (err) {
            throw err
        }
    }
}

module.exports = UrlParse